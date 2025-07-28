import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, clearAuthCache, forceRefreshSession } from '@/integrations/supabase/client';

console.log('💥 SIMPLIFIED AUTH: useAuth.ts loaded at', new Date().toISOString());

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar_url?: string;
  preferences?: {
    dietary_restrictions?: string[];
    cuisine_preferences?: string[];
    price_range?: [number, number];
  };
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  clearAuthCache: () => boolean;
  forceRefreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const authListenerSetup = useRef(false);

  console.log('💥 DEBUG: AuthProvider initialized');

  const createProfileFromUser = (user: User): UserProfile => {
    console.log('💥 DEBUG: Creating profile from user metadata');
    
    let fullName = user.user_metadata?.name || 
                   user.user_metadata?.full_name ||
                   user.user_metadata?.display_name ||
                   user.email?.split('@')[0] || 
                   'User';
    
    fullName = fullName.trim();
    
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || user.email?.split('@')[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || null;
    
    return {
      id: user.id,
      email: user.email || '',
      first_name: firstName,
      last_name: lastName,
      name: fullName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const clearCache = () => {
    console.log('💥 DEBUG: Clearing auth cache...');
    return clearAuthCache();
  };

  const forceRefresh = async (): Promise<boolean> => {
    return await forceRefreshSession();
  };

  useEffect(() => {
    console.log('💥 DEBUG: Setting up auth listener');
    
    if (authListenerSetup.current) {
      console.log('💥 DEBUG: Auth listener already setup, skipping');
      return;
    }
    
    authListenerSetup.current = true;

    const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (data && !error) {
          const profileWithName = {
            ...data,
            name: data.name || data.first_name || data.email?.split('@')[0] || 'User'
          };
          return profileWithName;
        }
      } catch (error) {
        console.error('💥 DEBUG: Profile fetch error:', error);
      }
      return null;
    };

    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log(`💥 DEBUG: Auth change event:`, event);
      console.log('💥 DEBUG: Session exists:', !!session);

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        console.log('💥 DEBUG: User authenticated, fetching profile');
        
        try {
          const dbProfile = await fetchUserProfile(session.user.id);
          
          if (dbProfile) {
            console.log('💥 DEBUG: Using database profile');
            setProfile(dbProfile);
          } else {
            console.log('💥 DEBUG: Using fallback profile from metadata');
            const fallbackProfile = createProfileFromUser(session.user);
            setProfile(fallbackProfile);
          }
        } catch (error) {
          console.error('💥 DEBUG: Profile fetch failed:', error);
          const fallbackProfile = createProfileFromUser(session.user);
          setProfile(fallbackProfile);
        }
      } else {
        console.log('💥 DEBUG: No user, clearing profile');
        setProfile(null);
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('💥 DEBUG: Initial session received:', !!session);
      if (error) {
        console.error('💥 DEBUG: Error getting initial session:', error);
      }
      handleAuthChange('INITIAL_SESSION', session);
    }).catch((error) => {
      console.error('💥 DEBUG: Error getting initial session:', error);
      setLoading(false);
    });

    return () => {
      console.log('💥 DEBUG: Cleaning up auth subscription');
      subscription.unsubscribe();
      authListenerSetup.current = false;
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: name ? { name } : {}
        }
      });

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      return { error };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      clearAuthCache();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: 'No authenticated user' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          avatar_url: updates.avatar_url,
          preferences: updates.preferences
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        return { error };
      }

      const profileWithName = {
        ...data,
        name: data.first_name || data.email?.split('@')[0] || 'User'
      };
      setProfile(profileWithName);
      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`
      });

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
        updateProfile,
        resetPassword,
        clearAuthCache: clearCache,
        forceRefreshSession: forceRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};