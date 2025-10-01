import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar_url?: string;
  preferences?: any; // Changed to any to match Json type
  created_at: string;
  updated_at: string;
  room_credits?: number;
  subscription_status?: string;
  subscription_type?: string;
  subscription_expires_at?: string;
  total_rooms_created?: number;
  // Note: Stripe fields only used for web/Android platforms
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
  clearAuthCache: () => void;
  forceRefreshSession: () => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cache with timestamp and session validation
  const profileCacheRef = useRef<{ 
    [userId: string]: { 
      data: UserProfile; 
      timestamp: number; 
      sessionId: string; 
    } 
  }>({});

  // Track in-progress fetches to prevent duplicates
  const fetchInProgressRef = useRef<{ [userId: string]: Promise<void> }>({});

  const fetchProfileWithRetry = async (userId: string, forceRefresh = false, retries = 3) => {
    // If a fetch is already in progress, wait for it
    if (fetchInProgressRef.current[userId] && !forceRefresh) {
      console.log('🔍 DEBUG: Fetch already in progress for user:', userId);
      return await fetchInProgressRef.current[userId];
    }

    const fetchPromise = (async () => {
      for (let i = 0; i < retries; i++) {
        try {
          console.log('🔍 DEBUG: Fetching profile for user:', userId, `(attempt ${i + 1}/${retries})`);
          
          // Check if we have valid cached data (ignore sessionId)
          const cached = profileCacheRef.current[userId];
          const cacheAge = Date.now() - (cached?.timestamp || 0);
          const cacheValid = cached && cacheAge < 300000; // 5 minutes
          console.log('🔍 DEBUG: Cache check:', {
            hasCached: !!cached,
            cacheAge,
            cacheValid,
            forceRefresh
          });
          
          if (!forceRefresh && cacheValid) {
            console.log('🔍 DEBUG: Using valid cached profile for user:', userId, cached.data);
            setProfile(cached.data);
            return;
          }
          
          // Fetch fresh data
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          console.log('🔍 DEBUG: Profile fetch result:', { data, error });

          if (error) {
            console.error('🔍 DEBUG: Profile fetch error:', error);
            throw error;
          }

          if (data) {
            const profileWithName: UserProfile = {
              ...data,
              name: data.first_name || data.email?.split('@')[0] || 'User'
            };
            
            // Cache with timestamp (no sessionId)
            profileCacheRef.current[userId] = {
              data: profileWithName,
              timestamp: Date.now(),
              sessionId: undefined // for legacy cleanup
            };
            
            console.log('🔍 DEBUG: Cached fresh profile for user:', userId, profileWithName);
            setProfile(profileWithName);
            return; // Success
          } else {
            throw new Error('No profile data returned');
          }
        } catch (error) {
          console.error(`🔍 DEBUG: Profile fetch attempt ${i + 1} failed:`, error);
          if (i === retries - 1) {
            // Last attempt failed, clear cache and set null
            delete profileCacheRef.current[userId];
            setProfile(null);
            throw error;
          } else {
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
          }
        }
      }
    })();

    // Store the promise to prevent duplicate fetches
    fetchInProgressRef.current[userId] = fetchPromise;
    
    try {
      await fetchPromise;
    } finally {
      // Clean up the promise reference
      delete fetchInProgressRef.current[userId];
    }
  };

  const fetchProfile = async (userId: string) => {
    await fetchProfileWithRetry(userId, false);
  };

  const refreshProfile = async (userId: string) => {
    await fetchProfileWithRetry(userId, true);
  };

  // Clean up old cache entries
  const cleanupCache = () => {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    Object.keys(profileCacheRef.current).forEach(userId => {
      const cached = profileCacheRef.current[userId];
      if (now - cached.timestamp > maxAge) {
        console.log('🔍 DEBUG: Cleaning up old cache for user:', userId);
        delete profileCacheRef.current[userId];
      }
    });
  };

  useEffect(() => {
    let isMounted = true;

    // Clean up cache periodically
    const cleanupInterval = setInterval(cleanupCache, 60000); // Every minute

    // Initialize auth by checking for existing session
    const initializeAuth = async () => {
      console.log('🔍 DEBUG: Initializing auth - checking for existing session');
      
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('🔍 DEBUG: Error getting session:', error);
        } else if (session) {
          console.log('🔍 DEBUG: Found existing session for:', session.user?.email);
          setUser(session.user);
          setSession(session);
          if (session.user) {
            await fetchProfile(session.user.id);
          }
        } else {
          console.log('🔍 DEBUG: No existing session found');
        }
      } catch (error) {
        console.log('🔍 DEBUG: Error during session check:', error);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('🔍 DEBUG: Auth state changed:', event, session?.user?.email);
        
        setUser(session?.user ?? null);
        setSession(session);
        
        // Always set loading to false after updating user/session state
        if (isMounted) {
          setLoading(false);
        }
        
        // Fetch profile asynchronously without blocking the loading state
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          // Clear profile when signed out
          setProfile(null);
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearInterval(cleanupInterval);
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name,
            name: name
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear cache when user signs out
      profileCacheRef.current = {};
      fetchInProgressRef.current = {};
      // Refresh the page to clear any room state and reset the app
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const clearAuthCache = () => {
    profileCacheRef.current = {};
    fetchInProgressRef.current = {};
  };

  const forceRefreshSession = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.refreshSession();
      return !error;
    } catch (error) {
      console.error('Force refresh failed:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    try {
      const { data, error } = await supabase.rpc('update_user_profile', {
        user_id_param: user.id,
        first_name_param: updates.first_name,
        last_name_param: updates.last_name,
        avatar_url_param: updates.avatar_url,
        preferences_param: updates.preferences
      });
      
      if (error) return { error };
      
      // Refresh profile after update
      await refreshProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    fetchProfile,
    refreshProfile,
    setProfile,
    clearAuthCache,
    forceRefreshSession,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};