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
  const componentId = useRef(Math.random().toString(36));

  console.log('💥 DEBUG: AuthProvider initialized with ID:', componentId.current);

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
    
    const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
      try {
        console.log('🔍 DEBUG: Fetching profile for user:', userId);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log('🔍 DEBUG: Profile fetch result:', { data, error });

        if (data && !error) {
          const profileWithName = {
            ...data,
            name: data.name || data.first_name || data.email?.split('@')[0] || 'User'
          };
          console.log('🔍 DEBUG: Returning profile:', profileWithName);
          return profileWithName;
        } else {
          console.log('🔍 DEBUG: No profile found or error:', { data, error });
        }
      } catch (error) {
        console.error('🔍 DEBUG: Profile fetch exception:', error);
      }
      return null;
    };

    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setSession(session);
      
      if (session?.user) {
        try {
          const dbProfile = await fetchUserProfile(session.user.id);
          if (dbProfile) {
            setProfile(dbProfile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Profile fetch failed:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      }
      handleAuthChange('INITIAL_SESSION', session);
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      setLoading(false);
    });

    return () => {
      console.log('💥 DEBUG: Cleaning up auth subscription');
      subscription.unsubscribe();
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

  const contextValue: AuthContextType = {
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
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};