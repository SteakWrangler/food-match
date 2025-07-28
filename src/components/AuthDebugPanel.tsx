import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2, AlertTriangle, Info } from 'lucide-react';

export const AuthDebugPanel = () => {
  const { user, profile, session, loading, clearAuthCache, forceRefreshSession } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isClearing, setIsClearing] = useState(false);
  const [localStorageInfo, setLocalStorageInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      // Get localStorage info
      const authKeys = [];
      const allKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allKeys.push(key);
          if (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth')) {
            authKeys.push(key);
          }
        }
      }

      setLocalStorageInfo({
        totalKeys: allKeys.length,
        authKeys: authKeys.length,
        authKeyNames: authKeys
      });

      setDebugInfo({
        timestamp: new Date().toISOString(),
        hasUser: !!user,
        hasProfile: !!profile,
        hasSession: !!session,
        loading,
        userId: user?.id || 'N/A',
        profileName: profile?.name || 'N/A',
        sessionExpiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
        timeUntilExpiry: session?.expires_at ? Math.floor((session.expires_at - Date.now() / 1000) / 60) : 'N/A',
        userEmail: user?.email || 'N/A',
        sessionAccessToken: session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'N/A',
        sessionRefreshToken: session?.refresh_token ? `${session.refresh_token.substring(0, 20)}...` : 'N/A'
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [user, profile, session, loading]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      clearAuthCache();
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleForceRefresh = async () => {
    setIsClearing(true);
    try {
      const success = await forceRefreshSession();
      console.log('Force refresh result:', success);
    } catch (error) {
      console.error('Force refresh failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleNuclearClear = async () => {
    setIsClearing(true);
    try {
      // Clear ALL localStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Supabase session
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.auth.signOut();
      
      // Reload the page to start fresh
      window.location.reload();
    } catch (error) {
      console.error('Nuclear clear failed:', error);
      setIsClearing(false);
    }
  };

  const handleFastMode = async () => {
    setIsClearing(true);
    try {
      // Clear cache first
      clearAuthCache();
      
      // Force immediate session refresh
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Fast mode: Session found, forcing refresh');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Fast mode: Refresh failed:', refreshError);
        } else {
          console.log('Fast mode: Session refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Fast mode failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const hasIssues = !user && !loading || (user && !profile && !loading);

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2 flex items-center gap-2">
        Auth Debug
        {hasIssues && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
      </h3>
      
      <div className="space-y-1 mb-3">
        <div className="flex justify-between">
          <span>User:</span>
          <span className={debugInfo.hasUser ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasUser ? '✅' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Profile:</span>
          <span className={debugInfo.hasProfile ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasProfile ? '✅' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Session:</span>
          <span className={debugInfo.hasSession ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasSession ? '✅' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Loading:</span>
          <span className={debugInfo.loading ? 'text-yellow-400' : 'text-green-400'}>
            {debugInfo.loading ? '✅' : '❌'}
          </span>
        </div>
        <div className="border-t border-gray-600 pt-1 mt-1">
          <div>Name: <span className="font-mono">{debugInfo.profileName}</span></div>
          <div>Email: <span className="font-mono">{debugInfo.userEmail}</span></div>
          <div>User ID: <span className="font-mono">{debugInfo.userId}</span></div>
          <div>Time Left: <span className="font-mono">{debugInfo.timeUntilExpiry} min</span></div>
        </div>
        
        <div className="border-t border-gray-600 pt-1 mt-1">
          <div>LocalStorage Keys: {localStorageInfo.totalKeys}</div>
          <div>Auth Keys: {localStorageInfo.authKeys}</div>
          {localStorageInfo.authKeyNames.length > 0 && (
            <div className="text-xs text-gray-400">
              Auth keys: {localStorageInfo.authKeyNames.join(', ')}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleClearCache}
          disabled={isClearing}
          className="text-xs h-6 px-2"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear Cache
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleForceRefresh}
          disabled={isClearing}
          className="text-xs h-6 px-2"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleFastMode}
          disabled={isClearing}
          className="text-xs h-6 px-2"
        >
          <Info className="w-3 h-3 mr-1" />
          Fast Mode
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={handleNuclearClear}
          disabled={isClearing}
          className="text-xs h-6 px-2"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Nuclear Clear
        </Button>
      </div>
    </div>
  );
}; 