import React, { useState, useEffect } from 'react';
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

const SubscriptionManager = () => {
  const { user, profile } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Error checking subscription:', error);
        toast.error('Failed to check subscription status');
      } else {
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to check subscription status');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

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

  const isSubscribed = subscriptionInfo?.subscribed || false;
  const subscriptionType = subscriptionInfo?.subscription_type || 'none';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle>Subscription Status</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkSubscription}
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
          <Card>
            <CardHeader>
              <CardTitle>Monthly Plan</CardTitle>
              <CardDescription>Perfect for regular users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$4.99<span className="text-lg font-normal">/month</span></div>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">✓ Unlimited room creation</li>
                <li className="text-sm">✓ Advanced filtering</li>
                <li className="text-sm">✓ Priority support</li>
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
                  <CardDescription>Best value - save 33%!</CardDescription>
                </div>
                <Badge>Popular</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$39.99<span className="text-lg font-normal">/year</span></div>
              <p className="text-sm text-green-600 mb-4">Save $20 compared to monthly</p>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">✓ Unlimited room creation</li>
                <li className="text-sm">✓ Advanced filtering</li>
                <li className="text-sm">✓ Priority support</li>
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
            Need more room credits? Purchase them individually without a subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">1 Credit</div>
                <div className="text-lg mb-3">$0.99</div>
                <Button 
                  variant="outline" 
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
                <div className="text-lg mb-1">$3.99</div>
                <div className="text-sm text-green-600 mb-3">Save $0.96!</div>
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