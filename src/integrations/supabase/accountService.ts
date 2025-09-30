import { supabase } from './client';

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

export interface AccountService {
  getAccountDeletionInfo(): Promise<{ data: DeletionInfo | null; error: Error | null }>;
  deleteAccount(): Promise<{ data: any; error: Error | null }>;
  exportAccountData(): Promise<{ data: any; error: Error | null }>;
}

class SupabaseAccountService implements AccountService {
  async getAccountDeletionInfo(): Promise<{ data: DeletionInfo | null; error: Error | null }> {
    try {
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

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error getting account deletion info:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to get account deletion info') 
      };
    }
  }

  async deleteAccount(): Promise<{ data: any; error: Error | null }> {
    try {
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

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to delete account') 
      };
    }
  }

  async exportAccountData(): Promise<{ data: any; error: Error | null }> {
    try {
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

      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error exporting account data:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to export account data') 
      };
    }
  }
}

// Create singleton instance
const accountService = new SupabaseAccountService();

export const getAccountService = (): AccountService => {
  return accountService;
};