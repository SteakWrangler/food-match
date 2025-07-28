import { supabase } from '@/integrations/supabase/client';

export interface AuthDebugInfo {
  hasSession: boolean;
  sessionExpiresAt?: number;
  timeUntilExpiry?: number;
  user?: any;
  lastApiCall?: {
    timestamp: number;
    success: boolean;
    error?: string;
  };
}

export const debugAuth = async (): Promise<AuthDebugInfo> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth debug error:', error);
      return {
        hasSession: false,
        lastApiCall: {
          timestamp: Date.now(),
          success: false,
          error: error.message
        }
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session?.expires_at;
    const timeUntilExpiry = expiresAt ? expiresAt - now : undefined;

    return {
      hasSession: !!session,
      sessionExpiresAt: expiresAt,
      timeUntilExpiry,
      user: session?.user,
      lastApiCall: {
        timestamp: Date.now(),
        success: true
      }
    };
  } catch (error) {
    console.error('Auth debug failed:', error);
    return {
      hasSession: false,
      lastApiCall: {
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

export const testApiCall = async (): Promise<{
  success: boolean;
  error?: string;
  response?: any;
}> => {
  try {
    console.log('🧪 Testing API call...');
    
    const { data, error } = await supabase.functions.invoke('google-places', {
      body: {
        action: 'search-restaurants',
        location: '37.7749,-122.4194', // San Francisco coordinates
        limit: 1
      },
    });

    if (error) {
      console.error('🧪 API call failed:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('🧪 API call successful:', data);
    return {
      success: true,
      response: data
    };
  } catch (error) {
    console.error('🧪 API call exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const logAuthState = () => {
  debugAuth().then(info => {
    console.log('🔍 Auth Debug Info:', {
      hasSession: info.hasSession,
      sessionExpiresAt: info.sessionExpiresAt ? new Date(info.sessionExpiresAt * 1000).toISOString() : 'N/A',
      timeUntilExpiry: info.timeUntilExpiry ? `${Math.floor(info.timeUntilExpiry / 60)} minutes` : 'N/A',
      userId: info.user?.id || 'N/A'
    });
  });
};

// Disabled auto-logging to prevent re-auth loops
// if (import.meta.env.DEV) {
//   setInterval(logAuthState, 30000);
// }