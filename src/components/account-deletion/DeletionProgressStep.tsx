import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeletionProgressStepProps {
  onComplete: () => void;
  onError: (error: string) => void;
}

type DeletionStage = 
  | 'starting'
  | 'cancelling-subscriptions'
  | 'deleting-data'
  | 'deleting-account'
  | 'complete'
  | 'error';

export const DeletionProgressStep: React.FC<DeletionProgressStepProps> = ({
  onComplete,
  onError
}) => {
  const [currentStage, setCurrentStage] = useState<DeletionStage>('starting');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performDeletion = async () => {
      try {
        setCurrentStage('starting');
        setProgress(10);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session');
        }

        // Stage 1: Cancelling subscriptions
        setCurrentStage('cancelling-subscriptions');
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Allow UI to update

        // Stage 2: Deleting user data
        setCurrentStage('deleting-data');
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Allow UI to update

        // Stage 3: Delete account
        setCurrentStage('deleting-account');
        setProgress(75);

        const response = await supabase.functions.invoke('delete-account', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || 'Failed to delete account');
        }

        // Complete
        setCurrentStage('complete');
        setProgress(100);
        
        // Wait a moment before calling onComplete to show success state
        setTimeout(() => {
          onComplete();
        }, 2000);

      } catch (err) {
        console.error('Error during account deletion:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
        setError(errorMessage);
        setCurrentStage('error');
        onError(errorMessage);
      }
    };

    performDeletion();
  }, [onComplete, onError]);

  const getStageText = () => {
    switch (currentStage) {
      case 'starting':
        return 'Initializing account deletion...';
      case 'cancelling-subscriptions':
        return 'Cancelling subscriptions...';
      case 'deleting-data':
        return 'Deleting your data...';
      case 'deleting-account':
        return 'Removing your account...';
      case 'complete':
        return 'Account successfully deleted!';
      case 'error':
        return 'Account deletion failed';
      default:
        return 'Processing...';
    }
  };

  const getStageIcon = () => {
    switch (currentStage) {
      case 'complete':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {getStageIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {getStageText()}
        </h3>

        {currentStage !== 'error' && currentStage !== 'complete' && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">{progress}% complete</p>
          </div>
        )}
      </div>

      {currentStage === 'complete' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your account has been successfully deleted. You will be redirected shortly.
          </AlertDescription>
        </Alert>
      )}

      {currentStage === 'error' && error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 text-sm text-gray-600">
        <h4 className="font-medium text-gray-900">Deletion Process:</h4>
        <div className="space-y-2">
          <div className={`flex items-center gap-2 ${
            ['cancelling-subscriptions', 'deleting-data', 'deleting-account', 'complete'].includes(currentStage) 
              ? 'text-green-600' 
              : currentStage === 'starting' 
                ? 'text-blue-600' 
                : 'text-gray-400'
          }`}>
            {['cancelling-subscriptions', 'deleting-data', 'deleting-account', 'complete'].includes(currentStage) ? (
              <CheckCircle className="h-4 w-4" />
            ) : currentStage === 'starting' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
            )}
            Cancelling active subscriptions
          </div>
          
          <div className={`flex items-center gap-2 ${
            ['deleting-data', 'deleting-account', 'complete'].includes(currentStage) 
              ? 'text-green-600' 
              : currentStage === 'cancelling-subscriptions' 
                ? 'text-blue-600' 
                : 'text-gray-400'
          }`}>
            {['deleting-data', 'deleting-account', 'complete'].includes(currentStage) ? (
              <CheckCircle className="h-4 w-4" />
            ) : currentStage === 'cancelling-subscriptions' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
            )}
            Removing your data and favorites
          </div>
          
          <div className={`flex items-center gap-2 ${
            ['deleting-account', 'complete'].includes(currentStage) 
              ? 'text-green-600' 
              : currentStage === 'deleting-data' 
                ? 'text-blue-600' 
                : 'text-gray-400'
          }`}>
            {['complete'].includes(currentStage) ? (
              <CheckCircle className="h-4 w-4" />
            ) : currentStage === 'deleting-account' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
            )}
            Deleting your account
          </div>
        </div>
      </div>

      {currentStage === 'error' && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      )}

      {(currentStage === 'starting' || currentStage === 'cancelling-subscriptions' || 
        currentStage === 'deleting-data' || currentStage === 'deleting-account') && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Please do not close this window while your account is being deleted.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};