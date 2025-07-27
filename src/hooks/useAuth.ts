import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('🔍 fetchProfile called for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      console.log('📊 Profile query result:', { data, error });

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return null;
      }

      const profileWithName = {
        ...data,
        name: data.first_name || data.email?.split('@')[0] || 'User'
      };

      console.log('✅ Profile with name computed:', profileWithName);
      return profileWithName;
    } catch (error) {
      console.error('💥 Error in fetchProfile:', error);
      return null;
    }
  };

  const handleAuthStateChange = async (event: string, newSession: Session | null) => {
    console.log('🔄 Auth state change:', event, 'userId:', newSession?.user?.id);
    console.log('🔄 Session details:', newSession ? 'exists' : 'null');
    
    setSession(newSession);
    setUser(newSession?.user || null);

    if (newSession?.user) {
      console.log('👤 User found, fetching profile for:', newSession.user.id);
      const userProfile = await fetchProfile(newSession.user.id);
      console.log('👤 Profile fetched:', userProfile ? 'success' : 'failed');
      setProfile(userProfile);
    } else {
      console.log('👤 No user, clearing profile');
      setProfile(null);
    }

    console.log('⏳ Setting loading to false');
    setLoading(false);
    console.log('✅ Auth state change complete');
  };

  useEffect(() => {
    console.log('🚀 Starting auth initialization...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session and handle it immediately
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      console.log('📱 Initial session check:', initialSession ? 'exists' : 'null', error ? `error: ${error.message}` : 'no error');
      handleAuthStateChange('INITIAL_SESSION', initialSession);
    }).catch((err) => {
      console.error('💥 Error getting initial session:', err);
      setLoading(false); // Ensure we don't stay stuck loading
    });

    return () => {
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
        name: data.first_name && data.last_name 
          ? `${data.first_name} ${data.last_name}`.trim()
          : data.first_name || data.last_name || ''
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

  return React.createElement(AuthContext.Provider, { value }, children);
};