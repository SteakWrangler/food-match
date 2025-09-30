import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, AlertTriangle, ExternalLink, DollarSign, Calendar, Heart, Clock, Coins } from 'lucide-react';
import { DeletionInfo } from './DeleteAccountDialog';

interface SubscriptionWarningStepProps {
  deletionInfo: DeletionInfo | null;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export const SubscriptionWarningStep: React.FC<SubscriptionWarningStepProps> = ({
  deletionInfo,
  onNext,
  onBack,
  onCancel
}) => {
  if (!deletionInfo) {
    return (
      <div className="space-y-6">
        <p className="text-gray-600">Loading subscription information...</p>
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const { subscriptionInfo, dataInfo, warnings } = deletionInfo;
  const hasActiveSubscription = warnings.hasActiveSubscription;
  const requiresManualCancellation = warnings.requiresManualCancellation;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {hasActiveSubscription && (
        <Alert className="border-orange-200 bg-orange-50">
          <CreditCard className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Active Subscription Detected</strong>
            <br />
            You have an active subscription that will be affected by account deletion.
          </AlertDescription>
        </Alert>
      )}

      {requiresManualCancellation && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Manual Cancellation Required</strong>
            <br />
            Your Apple subscription must be cancelled manually through your Apple ID settings. 
            Account deletion will not automatically cancel Apple subscriptions.
            <br />
            <br />
            <a 
              href="https://support.apple.com/en-us/HT202039" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-700 hover:text-red-900 underline"
            >
              Learn how to cancel <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Impact Summary</h3>
        
        {hasActiveSubscription && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription Details
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{subscriptionInfo.subscriptionType} ({subscriptionInfo.provider})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{subscriptionInfo.subscriptionStatus}</span>
              </div>
              {subscriptionInfo.subscriptionExpiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{formatDate(subscriptionInfo.subscriptionExpiresAt)}</span>
                </div>
              )}
              {subscriptionInfo.remainingValue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Value:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(subscriptionInfo.remainingValue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-900">Your Data</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </span>
              <span className="font-medium">{dataInfo.favoritesCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Room History
              </span>
              <span className="font-medium">{dataInfo.roomHistoryCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Room Credits
              </span>
              <span className="font-medium">{dataInfo.roomCreditsCount}</span>
            </div>
          </div>
        </div>

        {(warnings.hasData || warnings.hasCredits) && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Consider exporting your data before deletion if you want to keep a copy of your favorites and room history.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onNext}>
            I Understand, Continue
          </Button>
        </div>
      </div>
    </div>
  );
};