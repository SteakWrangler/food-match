import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, clearAuthCache, forceRefreshSession, isSessionStale } from '@/integrations/supabase/client';

console.log('💥💥💥 COMPLETE REWRITE: useAuth.ts loaded at', new Date().toISOString());

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
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  clearCache: () => Promise<void>;
  forceRefresh: () => Promise<boolean>;
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
  const authChangeCount = useRef(0);
  const lastProfileUpdate = useRef<number>(0);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  console.log('💥 DEBUG: AuthProvider initialized');

  const createProfileFromUser = (user: User): UserProfile => {
    console.log('💥 DEBUG: Creating profile from user metadata');
    console.log('💥 DEBUG: user.user_metadata:', user.user_metadata);
    
    // Extract name from various possible sources
    let fullName = user.user_metadata?.name || 
                   user.user_metadata?.full_name ||
                   user.user_metadata?.display_name ||
                   user.email?.split('@')[0] || 
                   'User';
    
    // Clean up the name - remove any extra whitespace
    fullName = fullName.trim();
    
    // Split into first and last name
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || user.email?.split('@')[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || null;
    
    console.log('💥 DEBUG: Computed name values:', { fullName, firstName, lastName });
    
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

  // Function to clear cache and refresh session
  const clearCache = async () => {
    console.log('💥 DEBUG: Clearing auth cache...');
    clearAuthCache();
    
    // Force a fresh session check
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('💥 DEBUG: Error getting session after cache clear:', error);
    } else if (session) {
      console.log('💥 DEBUG: Session restored after cache clear');
      setSession(session);
      setUser(session.user);
    }
  };

  const forceRefresh = async (): Promise<boolean> => {
    return await forceRefreshSession();
  };

  useEffect(() => {
    console.log('💥 DEBUG: Auth useEffect starting');
    
    const fetchUserProfile = async (userId: string) => {
      console.log('💥 DEBUG: Attempting to fetch profile for:', userId);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log('💥 DEBUG: Profile fetch result:', { data, error });

        if (data && !error) {
          const profileWithName = {
            ...data,
            name: data.name || data.first_name || data.email?.split('@')[0] || 'User'
          };
          console.log('💥 DEBUG: Using database profile:', profileWithName);
          return profileWithName;
        }
      } catch (error) {
        console.error('💥 DEBUG: Profile fetch error:', error);
      }
      return null;
    };

    const handleAuthChange = async (event: string, session: Session | null) => {
      authChangeCount.current++;
      const changeNumber = authChangeCount.current;
      console.log(`💥 DEBUG: Auth change event #${changeNumber}:`, event);
      console.log('💥 DEBUG: Session exists:', !!session);
      console.log('💥 DEBUG: User ID:', session?.user?.id);

      // Prevent race conditions by tracking the latest auth change
      const currentChangeNumber = changeNumber;

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        console.log('💥 DEBUG: User authenticated, processing profile');
        
        // Try database first
        const dbProfile = await fetchUserProfile(session.user.id);
        
        // Only update if this is still the latest auth change
        if (currentChangeNumber === authChangeCount.current) {
          if (dbProfile) {
            console.log('💥 DEBUG: Using database profile');
            setProfile(dbProfile);
            lastProfileUpdate.current = Date.now();
          } else {
            console.log('💥 DEBUG: Using fallback profile from metadata');
            const fallbackProfile = createProfileFromUser(session.user);
            setProfile(fallbackProfile);
            lastProfileUpdate.current = Date.now();
          }
        } else {
          console.log('💥 DEBUG: Auth change superseded, skipping profile update');
        }
      } else {
        console.log('💥 DEBUG: No user, clearing profile');
        if (currentChangeNumber === authChangeCount.current) {
          setProfile(null);
        }
      }

      // Only set loading to false if this is the latest auth change
      if (currentChangeNumber === authChangeCount.current) {
        console.log('💥 DEBUG: Setting loading to false');
        setLoading(false);
      }
    };

    console.log('💥 DEBUG: Setting up auth listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    console.log('💥 DEBUG: Getting initial session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('💥 DEBUG: Initial session received:', !!session);
      handleAuthChange('INITIAL_SESSION', session);
    }).catch((error) => {
      console.error('💥 DEBUG: Error getting initial session:', error);
      setLoading(false);
    });

    return () => {
      console.log('💥 DEBUG: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Add a periodic check to ensure profile doesn't get lost
  useEffect(() => {
    const checkProfileConsistency = () => {
      if (user && !profile && !loading) {
        console.log('💥 DEBUG: Profile lost, recreating from user data');
        const fallbackProfile = createProfileFromUser(user);
        setProfile(fallbackProfile);
        lastProfileUpdate.current = Date.now();
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkProfileConsistency, 30000);
    return () => clearInterval(interval);
  }, [user, profile, loading]);

  // Add session staleness check
  useEffect(() => {
    const checkSessionStaleness = async () => {
      const stale = await isSessionStale();
      if (stale && session) {
        console.log('💥 DEBUG: Session is stale, attempting refresh');
        try {
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error('💥 DEBUG: Failed to refresh stale session:', error);
            // If refresh fails, clear the session
            setSession(null);
            setUser(null);
            setProfile(null);
          } else {
            console.log('💥 DEBUG: Session refreshed successfully');
          }
        } catch (error) {
          console.error('💥 DEBUG: Error refreshing session:', error);
        }
      }
    };

    // Check session staleness every 2 minutes
    sessionCheckInterval.current = setInterval(checkSessionStaleness, 2 * 60 * 1000);

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [session]);

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
      // Clear cache on sign out
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
      lastProfileUpdate.current = Date.now();
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

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    clearCache,
    forceRefresh,
  };

  console.log('💥 DEBUG: AuthProvider rendering with values:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    profileName: profile?.name,
    lastProfileUpdate: new Date(lastProfileUpdate.current).toISOString()
  });

  return React.createElement(AuthContext.Provider, { value }, children);
};