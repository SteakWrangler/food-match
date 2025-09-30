import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteWarningStep } from './DeleteWarningStep';
import { SubscriptionWarningStep } from './SubscriptionWarningStep';
import { FinalConfirmationStep } from './FinalConfirmationStep';
import { DeletionProgressStep } from './DeletionProgressStep';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted: () => void;
}

export type DeletionStep = 'warning' | 'subscription' | 'confirmation' | 'progress' | 'complete';

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

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  isOpen,
  onClose,
  onAccountDeleted
}) => {
  const [currentStep, setCurrentStep] = useState<DeletionStep>('warning');
  const [deletionInfo, setDeletionInfo] = useState<DeletionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStepComplete = (nextStep: DeletionStep) => {
    setCurrentStep(nextStep);
  };

  const handleClose = () => {
    if (currentStep !== 'progress') {
      setCurrentStep('warning');
      setDeletionInfo(null);
      setError(null);
      onClose();
    }
  };

  const handleAccountDeleted = () => {
    onAccountDeleted();
    handleClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'warning':
        return (
          <DeleteWarningStep
            onNext={() => handleStepComplete('subscription')}
            onCancel={handleClose}
            onDeletionInfoLoaded={setDeletionInfo}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        );
      case 'subscription':
        return (
          <SubscriptionWarningStep
            deletionInfo={deletionInfo}
            onNext={() => handleStepComplete('confirmation')}
            onBack={() => handleStepComplete('warning')}
            onCancel={handleClose}
          />
        );
      case 'confirmation':
        return (
          <FinalConfirmationStep
            onConfirm={() => handleStepComplete('progress')}
            onBack={() => handleStepComplete('subscription')}
            onCancel={handleClose}
          />
        );
      case 'progress':
        return (
          <DeletionProgressStep
            onComplete={handleAccountDeleted}
            onError={(error) => {
              setError(error);
              setCurrentStep('confirmation');
            }}
          />
        );
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case 'warning':
        return 'Delete Account';
      case 'subscription':
        return 'Subscription Warning';
      case 'confirmation':
        return 'Confirm Account Deletion';
      case 'progress':
        return 'Deleting Account...';
      default:
        return 'Delete Account';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-red-600 font-semibold">
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>
        {renderCurrentStep()}
      </DialogContent>
    </Dialog>
  );
};