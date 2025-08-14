import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile, user, forceRefreshSession } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [processed, setProcessed] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Prevent multiple processing attempts
    if (hasStartedProcessing || !sessionId) {
      return;
    }

    const ensureSessionAndProcess = async () => {
      setHasStartedProcessing(true);
      
      try {
        // First, ensure we have a valid session
        let currentSession = await supabase.auth.getSession();
        
        // If no session, try to refresh it
        if (!currentSession.data.session && forceRefreshSession) {
          console.log('No session found, attempting to refresh...');
          await forceRefreshSession();
          currentSession = await supabase.auth.getSession();
        }

        // If still no session, redirect to login with return URL
        if (!currentSession.data.session) {
          console.log('Unable to restore session, redirecting to login');
          const returnUrl = `${window.location.pathname}${window.location.search}`;
          navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        setSessionRestored(true);

        // Now process the payment with a valid session
        await processPayment();
        
      } catch (error) {
        console.error('Error ensuring session and processing payment:', error);
        toast.error('Error processing payment');
        setProcessing(false);
      }
    };

    const processPayment = async () => {
      try {
        console.log('Processing payment for session:', sessionId);
        
        // Process credits if this was a credit purchase
        const { data: creditsData, error: creditsError } = await supabase.functions.invoke('process-credits', {
          body: { sessionId }
        });

        if (creditsError) {
          console.log('Credits processing error (might be subscription):', creditsError);
        } else if (creditsData?.creditsAdded) {
          if (creditsData.alreadyProcessed) {
            console.log('Session already processed, skipping duplicate notification');
          } else {
            toast.success(`Added ${creditsData.creditsAdded} room credits to your account!`);
          }
        }

        // Refresh subscription status
        const { error: subError } = await supabase.functions.invoke('check-subscription');
        if (subError) {
          console.error('Error checking subscription:', subError);
        }

        // Refresh user profile
        if (refreshProfile) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await refreshProfile(session.user.id);
          }
        }
        
        setProcessed(true);
        if (!creditsData?.alreadyProcessed) {
          toast.success('Payment processed successfully!');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error('Error processing payment');
      } finally {
        setProcessing(false);
      }
    };

    if (!hasStartedProcessing) {
      ensureSessionAndProcess();
    }
  }, [sessionId]); // Only depend on sessionId

  // Handle missing session ID
  useEffect(() => {
    if (!sessionId && !hasStartedProcessing) {
      toast.error('No session ID found');
      setProcessing(false);
    }
  }, [sessionId, hasStartedProcessing]);

  const handleContinue = () => {
    // Add subscription parameter to trigger subscription manager refresh
    navigate('/?subscription=true');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {processing ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {processing ? 'Processing Payment...' : 'Payment Successful!'}
          </CardTitle>
          <CardDescription>
            {processing 
              ? 'Please wait while we process your payment and update your account.'
              : 'Your payment has been processed and your account has been updated.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!processing && (
            <Button onClick={handleContinue} className="w-full">
              Continue to App
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;