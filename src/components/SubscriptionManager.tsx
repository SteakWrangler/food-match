import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_type: string;
  subscription_status: string;
  subscription_expires_at?: string;
}

interface SubscriptionManagerProps {
  onPurchaseComplete?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onPurchaseComplete }) => {
  const { user, profile } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true); // Start with true for initial load
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) return;

    console.log('🔍 Starting subscription check for user:', user.id);
    setRefreshing(true);
    try {
      console.log('🔍 Calling check-subscription edge function...');
      const { data, error } = await supabase.functions.invoke('check-subscription');
      console.log('🔍 Subscription check response:', { data, error });
      
      if (error) {
        console.error('❌ Error checking subscription:', error);
        toast.error('Failed to check subscription status');
      } else {
        console.log('✅ Subscription info loaded:', data);
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('❌ Exception during subscription check:', error);
      toast.error('Failed to check subscription status');
    } finally {
      console.log('🔍 Subscription check complete, setting refreshing to false');
      setRefreshing(false);
      setInitialLoadComplete(true);
    }
  }, [user]);

  const handleManualRefresh = async () => {
    if (!user || refreshing) return;
    
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('❌ Manual refresh error:', error);
        toast.error('Failed to refresh subscription status');
      } else {
        console.log('✅ Manual refresh successful:', data);
        setSubscriptionInfo(data);
        toast.success('Subscription status updated');
      }
    } catch (error) {
      console.error('❌ Manual refresh exception:', error);
      toast.error('Failed to refresh subscription status');
    } finally {
      console.log('🔄 Manual refresh complete');
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  const handleSubscribe = async (priceId: string, type: string) => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, type }
      });

      if (error) {
        toast.error('Failed to create checkout session');
        console.error('Checkout error:', error);
      } else if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) {
        toast.error('Failed to access customer portal');
        console.error('Portal error:', error);
      } else if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to access customer portal');
    } finally {
      setLoading(false);
    }
  };

  const buyCredits = async (priceId: string, credits: number) => {
    if (!user) {
      toast.error('Please log in to purchase credits');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, type: 'credits' }
      });

      if (error) {
        toast.error('Failed to create checkout session');
        console.error('Checkout error:', error);
      } else if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Show loading state while initial load is happening
  if (!initialLoadComplete && refreshing) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading subscription details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSubscribed = subscriptionInfo?.subscribed || false;
  const subscriptionType = subscriptionInfo?.subscription_type || 'none';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Subscription Status */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle>Subscription Status</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? `${subscriptionType} Subscriber` : 'Free Plan'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Room Credits: {profile?.room_credits || 0}
            </span>
          </div>
          
          {isSubscribed && (
            <div className="mb-4">
              <p className="text-sm text-green-600">
                ✓ Unlimited room creation
              </p>
              {subscriptionInfo?.subscription_expires_at && (
                <p className="text-sm text-muted-foreground">
                  Renews: {new Date(subscriptionInfo.subscription_expires_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {isSubscribed && (
            <Button onClick={handleManageSubscription} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      {!isSubscribed && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Plan</CardTitle>
                  <CardDescription>Perfect for regular users</CardDescription>
                </div>
                <div className="w-16"></div> {/* Placeholder for badge alignment */}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$5.00<span className="text-lg font-normal">/month</span></div>
              <div className="text-sm mb-4 invisible">Placeholder for alignment</div>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">✓ Unlimited room creation</li>
                <li className="text-sm">✓ Advanced filtering</li>
                <li className="text-sm invisible">Placeholder for alignment</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('price_1RvnXJD2Qzu3jxiC4fn6yJul', 'monthly')}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Subscribe Monthly
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Yearly Plan</CardTitle>
                  <CardDescription>Best value - save $10!</CardDescription>
                </div>
                <Badge>Popular</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$50.00<span className="text-lg font-normal">/year</span></div>
              <p className="text-sm text-green-600 mb-4">Save $10 compared to monthly</p>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">✓ Unlimited room creation</li>
                <li className="text-sm">✓ Advanced filtering</li>
                <li className="text-sm">✓ 2 months free</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe('price_1RvnXJD2Qzu3jxiCZQ5TO4TR', 'yearly')}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Subscribe Yearly
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Purchase */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Room Credits</CardTitle>
          </div>
          <CardDescription>
            Want to make a one-time room or want to use without subscribing?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-4 border-primary">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">1 Credit</div>
                <div className="text-lg mb-1">$1.00</div>
                <div className="text-sm text-muted-foreground mb-3">Create one room with real restaurant data</div>
                <Button 
                  className="w-full"
                  onClick={() => buyCredits('price_1RvncFD2Qzu3jxiCzi4Lrh5o', 1)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Buy 1 Credit
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-primary">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">5 Credits</div>
                <div className="text-lg mb-1">$4.00</div>
                <div className="text-sm text-green-600 mb-1">Save $1.00!</div>
                <div className="text-sm text-muted-foreground mb-2">Create five rooms with real restaurant data</div>
                <Button 
                  className="w-full"
                  onClick={() => buyCredits('price_1RvncpD2Qzu3jxiCbbDsb8FS', 5)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Buy 5 Credits
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;