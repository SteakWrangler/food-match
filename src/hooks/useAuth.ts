import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Computed field
  avatar_url?: string;
  preferences?: {
    foodPreferences?: string[];
    defaultRadius?: number;
    notifications?: boolean;
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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        console.log('Initial session check:', session ? 'exists' : 'null');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
          setLoading(false);
          console.log('Auth initialization completed');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('Fetching profile for user:', session.user.id);
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
          
          setLoading(false);
          console.log('Auth state change completed');
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        console.log('Profile found:', data);
        // Add computed name field for compatibility
        const profileWithName = {
          ...data,
          name: data.first_name && data.last_name 
            ? `${data.first_name} ${data.last_name}`.trim()
            : data.first_name || data.last_name || ''
        };
        setProfile(profileWithName);
      } else {
        console.log('No profile found, creating new one');
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              email: user?.email || '',
              first_name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }

        const profileWithName = {
          ...newProfile,
          name: newProfile.first_name || ''
        };
        setProfile(profileWithName);
        console.log('New profile created:', profileWithName);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email || '',
              first_name: name || email.split('@')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      return { error: null };
    } catch (error) {
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
      return { error: error as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    console.log('signOut function called');
    try {
      // Clear local state first to provide immediate feedback
      console.log('Clearing local state...');
      setUser(null);
      setSession(null);
      setProfile(null);
      
      console.log('Calling Supabase auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      console.log('Supabase signOut result:', error ? `Error: ${error.message}` : 'Success');
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw here, just log it and continue with local cleanup
      }
      
      // Don't reload the page - let React handle the state changes
      // The auth state change listener will handle the cleanup
      console.log('Sign out completed, auth state change listener should handle cleanup');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    console.log('updateProfile called with:', updates);
    console.log('user.id:', user.id);
    console.log('session:', session);

    try {
      console.log('=== TESTING SIMPLE RPC CALL ===');
      
      // First test a simple query to see if basic Supabase calls work
      console.log('Testing basic select query...');
      const testQuery = await supabase.from('profiles').select('id').eq('id', user.id).single();
      console.log('Basic query result:', testQuery);
      
      // If that works, test our RPC function
      if (!testQuery.error) {
        console.log('Basic query worked, testing RPC...');
        
        // Add a timeout to the RPC call
        const rpcPromise = supabase.rpc('update_user_profile_debug', {
          user_id_param: user.id,
          first_name_param: updates.first_name || null,
          last_name_param: updates.last_name || null,
          avatar_url_param: updates.avatar_url || null,
          preferences_param: updates.preferences || null
        });
        
        // Race the RPC call against a timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('RPC call timed out after 5 seconds')), 5000);
        });
        
        try {
          const result = await Promise.race([rpcPromise, timeoutPromise]) as any;
          console.log('RPC response:', result);
          
          if (result.error) {
            console.error('Database error:', result.error);
            return { error: result.error };
          }

          if (result.data) {
            // Add computed name field
            const profileWithName = {
              ...result.data,
              name: result.data.first_name && result.data.last_name 
                ? `${result.data.first_name} ${result.data.last_name}`.trim()
                : result.data.first_name || result.data.last_name || ''
            };
            setProfile(profileWithName);
          }
          return { error: null };
        } catch (rpcError) {
          console.error('RPC call failed or timed out:', rpcError);
          return { error: { message: rpcError instanceof Error ? rpcError.message : 'RPC call failed' } };
        }
      } else {
        console.error('Basic query failed:', testQuery.error);
        return { error: testQuery.error };
      }
    } catch (err) {
      console.error('Caught exception:', err);
      return { error: { message: 'Update failed' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      return { error };
    } catch (error) {
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