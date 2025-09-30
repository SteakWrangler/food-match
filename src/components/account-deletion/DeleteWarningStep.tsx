import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DeletionInfo } from './DeleteAccountDialog';

interface DeleteWarningStepProps {
  onNext: () => void;
  onCancel: () => void;
  onDeletionInfoLoaded: (info: DeletionInfo) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const DeleteWarningStep: React.FC<DeleteWarningStepProps> = ({
  onNext,
  onCancel,
  onDeletionInfoLoaded,
  isLoading,
  setIsLoading,
  error,
  setError
}) => {
  useEffect(() => {
    const fetchDeletionInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        const response = await supabase.functions.invoke('get-account-deletion-info', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to get account deletion info');
        }

        onDeletionInfoLoaded(response.data);
      } catch (err) {
        console.error('Error fetching deletion info:', err);
        setError(err instanceof Error ? err.message : 'Failed to load account information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeletionInfo();
  }, [onDeletionInfoLoaded, setIsLoading, setError]);

  const handleProceed = () => {
    if (!isLoading && !error) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Warning:</strong> This action cannot be undone. Deleting your account will permanently remove all your data.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">What will be deleted:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Your account and profile information
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            All saved restaurant favorites
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Room history and past sessions
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Any remaining room credits
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Active subscriptions (will be cancelled)
          </li>
        </ul>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleProceed}
          disabled={isLoading || !!error}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
};