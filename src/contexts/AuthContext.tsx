import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

console.log('🚀 NEW AUTH CONTEXT LOADED:', new Date().toISOString());

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

  console.log('🚀 AuthProvider initialized');

  useEffect(() => {
    console.log('🚀 Starting auth effect');
    
    const fetchUserProfile = async (userId: string) => {
      console.log('🚀 Fetching profile for:', userId);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        console.log('🚀 Profile fetch result:', { data, error });

        if (!error && data) {
          const profileWithName = {
            ...data,
            name: data.first_name ? 
              `${data.first_name}${data.last_name ? ' ' + data.last_name : ''}` : 
              data.email?.split('@')[0] || 'User'
          };
          console.log('🚀 Using database profile:', profileWithName);
          return profileWithName;
        }
      } catch (error) {
        console.error('🚀 Profile fetch error:', error);
      }
      return null;
    };

    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('🚀 Auth change:', event, !!session);
      
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        console.log('🚀 Fetching profile for authenticated user');
        const dbProfile = await fetchUserProfile(session.user.id);
        setProfile(dbProfile);
      } else {
        console.log('🚀 No user, clearing profile');
        setProfile(null);
      }

      console.log('🚀 Setting loading to false');
      setLoading(false);
    };

    console.log('🚀 Setting up auth listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    console.log('🚀 Getting initial session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🚀 Initial session received:', !!session);
      handleAuthChange('INITIAL_SESSION', session);
    }).catch((error) => {
      console.error('🚀 Error getting initial session:', error);
      setLoading(false);
    });

    return () => {
      console.log('🚀 Cleaning up auth subscription');
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
        name: data.first_name ? 
          `${data.first_name}${data.last_name ? ' ' + data.last_name : ''}` : 
          data.email?.split('@')[0] || 'User'
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
  };

  console.log('🚀 AuthProvider rendering with:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    profileName: profile?.name
  });

  return React.createElement(AuthContext.Provider, { value }, children);
};