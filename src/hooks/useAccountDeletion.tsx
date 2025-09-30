import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DeletionInfo {
  subscriptionInfo: {
    hasActiveSubscription: boolean;
    subscriptionType: string;
    subscriptionStatus: string;
    remainingValue: number;
    subscriptionExpiresAt: string | null;
    provider: string;
  };
  dataInfo: {
    favoritesCount: number;
    roomHistoryCount: number;
    roomCreditsCount: number;
  };
  warnings: {
    hasActiveSubscription: boolean;
    hasData: boolean;
    hasCredits: boolean;
    requiresManualCancellation: boolean;
  };
}

export type DeletionStep = 'warning' | 'subscription' | 'confirmation' | 'progress' | 'complete';

interface UseAccountDeletionReturn {
  // State
  currentStep: DeletionStep;
  deletionInfo: DeletionInfo | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentStep: (step: DeletionStep) => void;
  fetchDeletionInfo: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  exportAccountData: () => Promise<void>;
  resetState: () => void;
  retry: () => Promise<void>;
}

export const useAccountDeletion = (): UseAccountDeletionReturn => {
  const [currentStep, setCurrentStep] = useState<DeletionStep>('warning');
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setCurrentStep('warning');
    setDeletionInfo(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const fetchDeletionInfo = useCallback(async () => {
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

      setDeletionInfo(response.data);
      
      toast({
        title: "Account information loaded",
        description: "Ready to proceed with account deletion process.",
      });

    } catch (err) {
      console.error('Error fetching deletion info:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load account information';
      setError(errorMessage);
      
      toast({
        title: "Error loading account info",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete account');
      }

      toast({
        title: "Account deleted successfully",
        description: "Your account and all associated data have been permanently removed.",
      });

      // The user will be signed out automatically by the deletion process
      setCurrentStep('complete');

    } catch (err) {
      console.error('Error deleting account:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
      
      toast({
        title: "Account deletion failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw err; // Re-throw to allow components to handle the error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const exportAccountData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await supabase.functions.invoke('export-account-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to export account data');
      }

      // Create and download the file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `toss-or-taste-account-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your account data has been downloaded to your device.",
      });

    } catch (err) {
      console.error('Error exporting account data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to export account data';
      setError(errorMessage);
      
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const retry = useCallback(async () => {
    setError(null);
    
    if (currentStep === 'warning' || currentStep === 'subscription') {
      await fetchDeletionInfo();
    } else if (currentStep === 'progress') {
      await deleteAccount();
    }
  }, [currentStep, fetchDeletionInfo, deleteAccount]);

  return {
    // State
    currentStep,
    deletionInfo,
    isLoading,
    error,
    
    // Actions
    setCurrentStep,
    fetchDeletionInfo,
    deleteAccount,
    exportAccountData,
    resetState,
    retry,
  };
};