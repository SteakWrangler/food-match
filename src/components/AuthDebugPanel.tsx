import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';

export const AuthDebugPanel = () => {
  const { user, profile, session, loading, clearCache, forceRefresh } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        timestamp: new Date().toISOString(),
        hasUser: !!user,
        hasProfile: !!profile,
        hasSession: !!session,
        loading,
        userId: user?.id || 'N/A',
        profileName: profile?.name || 'N/A',
        sessionExpiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
        timeUntilExpiry: session?.expires_at ? Math.floor((session.expires_at - Date.now() / 1000) / 60) : 'N/A'
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [user, profile, session, loading]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearCache();
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
      const success = await forceRefresh();
      console.log('Force refresh result:', success);
    } catch (error) {
      console.error('Force refresh failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1 mb-3">
        <div>User: {debugInfo.hasUser ? '✅' : '❌'}</div>
        <div>Profile: {debugInfo.hasProfile ? '✅' : '❌'}</div>
        <div>Session: {debugInfo.hasSession ? '✅' : '❌'}</div>
        <div>Loading: {debugInfo.loading ? '✅' : '❌'}</div>
        <div>Name: {debugInfo.profileName}</div>
        <div>Expires: {debugInfo.sessionExpiresAt}</div>
        <div>Time Left: {debugInfo.timeUntilExpiry} min</div>
        <div>Updated: {debugInfo.timestamp}</div>
      </div>
      
      <div className="flex gap-2">
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
      </div>
    </div>
  );
}; 