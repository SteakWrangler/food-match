import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface FinalConfirmationStepProps {
  onConfirm: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export const FinalConfirmationStep: React.FC<FinalConfirmationStepProps> = ({
  onConfirm,
  onBack,
  onCancel
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [understood, setUnderstood] = useState(false);

  const isConfirmationValid = confirmationText.trim().toUpperCase() === 'DELETE';
  const canProceed = isConfirmationValid && understood;

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <ShieldAlert className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Final Warning:</strong> This is your last chance to cancel. Once you proceed, your account and all data will be permanently deleted.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Final Confirmation Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            To confirm account deletion, please type <strong>DELETE</strong> in the box below:
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Type "DELETE" to confirm:
            </Label>
            <Input
              id="confirmation"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE"
              className={`${
                confirmationText && !isConfirmationValid 
                  ? 'border-red-300 focus:border-red-500' 
                  : ''
              }`}
              autoComplete="off"
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-red-600">
                Please type "DELETE" exactly as shown (case insensitive)
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={understood}
              onChange={(e) => setUnderstood(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              I understand that this action is permanent and cannot be undone. All my data, 
              including favorites, room history, and account information will be permanently deleted.
            </span>
          </label>
        </div>

        {!understood && confirmationText && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please confirm that you understand the consequences before proceeding.
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
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!canProceed}
            className={`${
              canProceed 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Delete My Account Forever
          </Button>
        </div>
      </div>
    </div>
  );
};