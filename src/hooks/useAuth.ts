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
    console.log('🔍 DEBUG: fetchProfile called for userId:', userId);
    console.log('🔍 DEBUG: About to call supabase.from(profiles)');
    
    try {
      console.log('🔍 DEBUG: Making database query...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      console.log('📊 DEBUG: Profile query completed');
      console.log('📊 DEBUG: Profile query result - data:', data);
      console.log('📊 DEBUG: Profile query result - error:', error);
      console.log('📊 DEBUG: Raw profile data:', JSON.stringify(data, null, 2));

      if (error) {
        console.error('❌ DEBUG: Error fetching profile:', error);
        console.error('❌ DEBUG: Error message:', error.message);
        console.error('❌ DEBUG: Error details:', error.details);
        return null;
      }

      if (!data) {
        console.log('⚠️ DEBUG: No profile data found for user:', userId);
        return null;
      }

      console.log('🔤 DEBUG: data.first_name =', data.first_name);
      console.log('🔤 DEBUG: data.last_name =', data.last_name);
      console.log('🔤 DEBUG: data.email =', data.email);
      console.log('🔤 DEBUG: email split =', data.email?.split('@')[0]);

      // Use first_name if available, otherwise fall back to email prefix
      const displayName = data.first_name || data.email?.split('@')[0] || 'User';
      console.log('🎯 DEBUG: Computed displayName =', displayName);

      const finalProfile = {
        ...data,
        name: displayName
      };

      console.log('✅ DEBUG: Final profile with name:', JSON.stringify(finalProfile, null, 2));
      return finalProfile;
    } catch (error) {
      console.error('💥 DEBUG: Catch block - Error in fetchProfile:', error);
      console.error('💥 DEBUG: Error type:', typeof error);
      console.error('💥 DEBUG: Error constructor:', error?.constructor?.name);
      return null;
    }
  };


  useEffect(() => {
    console.log('🚀 DEBUG: useAuth useEffect starting - setting up auth listener');
    
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🚀 DEBUG: Auth state change event:', event);
      console.log('🚀 DEBUG: Session exists:', !!session);
      console.log('🚀 DEBUG: User ID:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        console.log('🚀 DEBUG: User authenticated, calling fetchProfile');
        try {
          const profile = await fetchProfile(session.user.id);
          if (profile) {
            console.log('🚀 DEBUG: Profile loaded successfully:', profile.name);
            setProfile(profile);
          } else {
            console.log('🚀 DEBUG: No profile found, using fallback');
            // Create fallback profile from user metadata
            const fallbackProfile = {
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'User',
              last_name: session.user.user_metadata?.name?.split(' ')[1] || null,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            console.log('🚀 DEBUG: Setting fallback profile:', fallbackProfile);
            setProfile(fallbackProfile);
          }
        } catch (error) {
          console.error('🚀 DEBUG: Error in profile fetch, using metadata fallback:', error);
          const fallbackProfile = {
            id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.name?.split(' ')[0] || session.user.email?.split('@')[0] || 'User',
            last_name: session.user.user_metadata?.name?.split(' ')[1] || null,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(fallbackProfile);
        }
      } else {
        console.log('🚀 DEBUG: No user, clearing profile');
        setProfile(null);
      }
      
      console.log('🚀 DEBUG: Setting loading to false');
      setLoading(false);
    });
    
    console.log('🚀 DEBUG: Auth listener set up, getting initial session');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🚀 DEBUG: Initial session retrieved:', !!session);
      // The onAuthStateChange will handle this session automatically
    }).catch((err) => {
      console.error('🚀 DEBUG: Error getting initial session:', err);
      setLoading(false);
    });

    return () => {
      console.log('🚀 DEBUG: Cleaning up auth subscription');
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