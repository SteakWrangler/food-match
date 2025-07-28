import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahfytcfndbnwrabryjnz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZnl0Y2ZuZGJud3JhYnJ5am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDg4MzYsImV4cCI6MjA2NTI4NDgzNn0.AqS0Q7EYe6IzXXAnHOKxwkmyV0I_Mrvab2CFLe7W8o8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable this to prevent duplicate events
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('Failed to get item from localStorage:', error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Failed to set item in localStorage:', error);
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove item from localStorage:', error);
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'toss-or-taste-web'
    }
  }
});

// Cache clearing functions
export const clearAuthCache = () => {
  try {
    // Clear all Supabase-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Cleared cached auth item:', key);
    });

    // Clear sessionStorage as well
    sessionStorage.clear();
    
    console.log('Auth cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear auth cache:', error);
    return false;
  }
};

export const forceRefreshSession = async () => {
  try {
    console.log('Force refreshing session...');
    
    // Clear any cached session data
    clearAuthCache();
    
    // Get a fresh session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting fresh session:', error);
      return false;
    }
    
    if (session) {
      console.log('Fresh session obtained successfully');
      return true;
    } else {
      console.log('No session found after refresh');
      return false;
    }
  } catch (error) {
    console.error('Force refresh failed:', error);
    return false;
  }
};

// Function to check if session is stale
export const isSessionStale = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return true;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    
    // Consider session stale if it expires in less than 5 minutes
    return (expiresAt - now) < 300;
  } catch (error) {
    console.error('Error checking session staleness:', error);
    return true;
  }
}; 