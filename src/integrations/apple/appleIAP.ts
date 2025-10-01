import { shouldUseApplePayments } from '../../utils/platformUtils';
import { supabase } from '../supabase/client';

// TypeScript declarations for cordova-plugin-purchase
declare global {
  interface Window {
    store?: {
      CONSUMABLE: string;
      PAID_SUBSCRIPTION: string;
      APPLE_APPSTORE: string;
      register: (product: { id: string; type: string; platform: string }) => void;
      ready: (callback: () => void) => void;
      refresh: () => void;
      when: (productId: string) => {
        initiated: (callback: (product: any) => void) => any;
        approved: (callback: (product: any) => void) => any;
        verified: (callback: (product: any) => void) => any;
        finished: (callback: (product: any) => void) => any;
        error: (callback: (error: any) => void) => any;
      };
      order: (productId: string) => void;
      get: (productId: string) => any;
      registeredProducts: any[];
    };
    CdvPurchase?: any;
  }
}

// Your App Store Connect Product IDs
export const APPLE_PRODUCT_IDS = {
  SINGLE_CREDIT: 'com.linksmarttech.tossortaste.single_credit',
  CREDIT_PACK: 'com.linksmarttech.tossortaste.credit_pack',
  PREMIUM_MONTHLY: 'com.linksmarttech.tossortaste.premium_monthly',
  PREMIUM_ANNUAL: 'com.linksmarttech.tossortaste.premium_annual',
} as const;

export class AppleIAPService {
  private static instance: AppleIAPService;
  private isInitialized = false;

  static getInstance(): AppleIAPService {
    if (!AppleIAPService.instance) {
      AppleIAPService.instance = new AppleIAPService();
    }
    return AppleIAPService.instance;
  }

  private waitForCdvPurchase(): Promise<void> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 100; // 100 attempts * 100ms = 10 seconds
      
      const checkCdvPurchase = () => {
        attempts++;
        console.log(`🍎 CdvPurchase check attempt ${attempts}/${maxAttempts}`);
        
        // Check for CdvPurchase object
        if (window.CdvPurchase) {
          console.log('🍎 Found CdvPurchase, initializing store...');
          this.initializeCdvPurchase();
          resolve();
          return;
        }
        
        // Also check if window.store is properly populated
        if (window.store && Object.keys(window.store).length > 0) {
          console.log('🍎 Found populated window.store with keys:', Object.keys(window.store));
          resolve();
          return;
        }
        
        console.log('🍎 CdvPurchase not ready yet, available properties:', 
          Object.keys(window).filter(key => key.toLowerCase().includes('cdv') || key.toLowerCase().includes('store')));
        
        if (attempts >= maxAttempts) {
          console.log('🍎 CdvPurchase timeout - proceeding anyway');
          resolve();
        } else {
          setTimeout(checkCdvPurchase, 100);
        }
      };
      
      // Start checking immediately
      checkCdvPurchase();
    });
  }

  private initializeCdvPurchase(): void {
    if (!window.CdvPurchase) {
      console.log('🍎 CdvPurchase not available');
      return;
    }

    try {
      console.log('🍎 Initializing CdvPurchase store...');
      
      // Initialize the store with CdvPurchase
      const store = window.CdvPurchase.store;
      
      if (store) {
        console.log('🍎 CdvPurchase.store available, setting up window.store');
        window.store = store;
      } else {
        console.log('🍎 CdvPurchase.store not available');
      }
    } catch (error) {
      console.error('🍎 Error initializing CdvPurchase:', error);
    }
  }

  async initialize(userId: string): Promise<void> {
    if (!shouldUseApplePayments()) {
      console.log('Not iOS platform, skipping Apple IAP initialization');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🍎 Starting Apple IAP initialization...');
      
      // Wait for CdvPurchase to be available
      await this.waitForCdvPurchase();
      console.log('🍎 CdvPurchase initialization completed');

      console.log('🍎 Checking for window.store...', !!window.store);
      if (!window.store || !window.store.register) {
        console.error('🍎 Store plugin not properly initialized after waiting');
        console.log('🍎 Available window properties:', Object.keys(window).filter(key => 
          key.toLowerCase().includes('store') || key.toLowerCase().includes('cordova')));
        console.log('🍎 Window.store exists?', !!window.store);
        if (window.store) {
          console.log('🍎 Window.store properties:', Object.keys(window.store));
        }
        throw new Error('Store plugin failed to initialize');
      }

      console.log('🍎 Store object properties:', Object.keys(window.store));
      console.log('🍎 Store constants available:', {
        CONSUMABLE: !!window.store.CONSUMABLE,
        PAID_SUBSCRIPTION: !!window.store.PAID_SUBSCRIPTION,
        register: !!window.store.register,
        ready: !!window.store.ready
      });

      // Register all products
      console.log('🍎 Registering products...');
      
      try {
        window.store.register({
          id: APPLE_PRODUCT_IDS.SINGLE_CREDIT,
          type: window.store.CONSUMABLE,
          platform: window.store.APPLE_APPSTORE,
        });
        console.log('🍎 Registered SINGLE_CREDIT:', APPLE_PRODUCT_IDS.SINGLE_CREDIT);
      } catch (e) {
        console.error('🍎 Failed to register SINGLE_CREDIT:', e);
      }

      try {
        window.store.register({
          id: APPLE_PRODUCT_IDS.CREDIT_PACK,
          type: window.store.CONSUMABLE,
          platform: window.store.APPLE_APPSTORE,
        });
        console.log('🍎 Registered CREDIT_PACK:', APPLE_PRODUCT_IDS.CREDIT_PACK);
      } catch (e) {
        console.error('🍎 Failed to register CREDIT_PACK:', e);
      }

      try {
        window.store.register({
          id: APPLE_PRODUCT_IDS.PREMIUM_MONTHLY,
          type: window.store.PAID_SUBSCRIPTION,
          platform: window.store.APPLE_APPSTORE,
        });
        console.log('🍎 Registered PREMIUM_MONTHLY:', APPLE_PRODUCT_IDS.PREMIUM_MONTHLY);
      } catch (e) {
        console.error('🍎 Failed to register PREMIUM_MONTHLY:', e);
      }

      try {
        window.store.register({
          id: APPLE_PRODUCT_IDS.PREMIUM_ANNUAL,
          type: window.store.PAID_SUBSCRIPTION,
          platform: window.store.APPLE_APPSTORE,
        });
        console.log('🍎 Registered PREMIUM_ANNUAL:', APPLE_PRODUCT_IDS.PREMIUM_ANNUAL);
      } catch (e) {
        console.error('🍎 Failed to register PREMIUM_ANNUAL:', e);
      }

      console.log('🍎 All products registered, setting up handlers...');
      
      // Set up purchase handlers
      this.setupPurchaseHandlers();

      console.log('🍎 Handlers set up, initializing store...');
      
      // Initialize the store and load product info
      window.store.ready(() => {
        console.log('🍎 Apple IAP store ready, refreshing products...');
        window.store?.refresh();
        
        // Log product info after refresh
        setTimeout(() => {
          console.log('🍎 Store ready - checking all products...');
          console.log('🍎 Registered products:', window.store?.registeredProducts);
          
          Object.values(APPLE_PRODUCT_IDS).forEach(productId => {
            const product = window.store?.get(productId);
            console.log(`🍎 Product ${productId}:`, product || 'NOT FOUND');
            if (product) {
              console.log(`🍎 Product ${productId} details:`, {
                id: product.id,
                title: product.title,
                description: product.description,
                price: product.price,
                currency: product.currency,
                loaded: product.loaded,
                valid: product.valid,
                canPurchase: product.canPurchase
              });
            }
          });
          
          // Also log all available products
          const allProducts = window.store?.registeredProducts || [];
          console.log('🍎 All registered products:', allProducts.map((p: any) => ({
            id: p.id,
            loaded: p.loaded,
            valid: p.valid
          })));
        }, 2000);
      });

      this.isInitialized = true;
      console.log('🍎 Apple IAP initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Apple IAP:', error);
      throw error;
    }
  }

  private setupPurchaseHandlers(): void {
    if (!window.store) return;

    try {
      console.log('🍎 Setting up purchase event handlers...');
      
      // Handle all products with the new event system
      Object.values(APPLE_PRODUCT_IDS).forEach(productId => {
        try {
          const productHandler = window.store?.when(productId);
          if (productHandler) {
            productHandler
              .approved((product: any) => {
                console.log('🍎 Purchase approved:', product);
                // Finish the transaction
                product.finish();
              })
              .verified((product: any) => {
                console.log('🍎 Purchase verified:', product);
                // Update backend based on product type
                this.handleVerifiedPurchase(product);
              })
              .error((error: any) => {
                console.error('🍎 Purchase error:', error);
              });
            console.log(`🍎 Event handlers set for product: ${productId}`);
          } else {
            console.log(`🍎 Failed to set handlers for product: ${productId}`);
          }
        } catch (productError) {
          console.error(`🍎 Error setting up handlers for ${productId}:`, productError);
        }
      });
    } catch (error) {
      console.error('🍎 Error in setupPurchaseHandlers:', error);
      throw error;
    }
  }

  private async handleVerifiedPurchase(product: any): Promise<void> {
    const productId = product.id;

    try {
      if (productId === APPLE_PRODUCT_IDS.SINGLE_CREDIT) {
        await this.updateBackendCredits(1);
      } else if (productId === APPLE_PRODUCT_IDS.CREDIT_PACK) {
        await this.updateBackendCredits(5);
      } else if (productId === APPLE_PRODUCT_IDS.PREMIUM_MONTHLY) {
        await this.updateBackendSubscription('monthly');
      } else if (productId === APPLE_PRODUCT_IDS.PREMIUM_ANNUAL) {
        await this.updateBackendSubscription('annual');
      }
    } catch (error) {
      console.error('Failed to update backend after purchase:', error);
    }
  }

  async purchaseCredits(creditAmount: 1 | 5): Promise<boolean> {
    console.log('🍎 purchaseCredits called:', { creditAmount, isInitialized: this.isInitialized, hasStore: !!window.store });
    
    if (!shouldUseApplePayments()) {
      console.log('🍎 Not on iOS platform');
      return false;
    }
    
    if (!this.isInitialized) {
      console.log('🍎 Apple IAP not initialized');
      return false;
    }
    
    if (!window.store) {
      console.log('🍎 Window.store not available');
      return false;
    }

    try {
      const productId = creditAmount === 1 ? APPLE_PRODUCT_IDS.SINGLE_CREDIT : APPLE_PRODUCT_IDS.CREDIT_PACK;
      
      console.log('🍎 Initiating credit purchase:', productId);
      const product = window.store.get(productId);
      console.log('🍎 Product info before purchase:', product);
      
      // TEMPORARY: Mock successful purchase for testing while App Store Connect products are being set up
      if (!product || !product.loaded || !product.valid) {
        console.log('🍎 Product not loaded from App Store - using MOCK PURCHASE for testing');
        console.log('🍎 ⚠️  This is a TEST ONLY - no actual payment is processed!');
        console.log('🍎 Product details:', { loaded: product?.loaded, valid: product?.valid, canPurchase: product?.canPurchase });
        
        // Simulate a successful purchase after 1 second
        setTimeout(async () => {
          console.log('🍎 MOCK: Purchase approved');
          console.log('🍎 MOCK: Purchase verified');
          try {
            await this.updateBackendCredits(creditAmount);
            console.log('🍎 MOCK: Credits successfully added to account');
          } catch (error) {
            console.error('🍎 MOCK: Failed to add credits:', error);
          }
        }, 1000);
        
        return true;
      }
      
      // Set up one-time listeners for this specific purchase
      this.setupSinglePurchaseHandler(productId);
      
      const result = window.store.order(productId);
      console.log('🍎 Purchase order result:', result);
      
      // Return true immediately - actual success is handled in the verified callback
      return true;
    } catch (error) {
      console.error('🍎 Failed to purchase credits:', error);
      return false;
    }
  }

  async purchaseSubscription(type: 'monthly' | 'annual'): Promise<boolean> {
    if (!shouldUseApplePayments() || !this.isInitialized || !window.store) {
      return false;
    }

    try {
      const productId = type === 'monthly' ? APPLE_PRODUCT_IDS.PREMIUM_MONTHLY : APPLE_PRODUCT_IDS.PREMIUM_ANNUAL;
      
      console.log('Initiating subscription purchase:', productId);
      window.store.order(productId);
      
      // Return true immediately - actual success is handled in the verified callback
      return true;
    } catch (error) {
      console.error('Failed to purchase subscription:', error);
      return false;
    }
  }

  private setupSinglePurchaseHandler(productId: string): void {
    try {
      console.log(`🍎 Setting up single purchase handler for: ${productId}`);
      
      const productHandler = window.store?.when(productId);
      if (productHandler) {
        productHandler
          .initiated((product: any) => {
            console.log('🍎 Purchase initiated:', product);
          })
          .approved((product: any) => {
            console.log('🍎 Purchase approved:', product);
            // Finish the transaction
            product.finish();
          })
          .verified((product: any) => {
            console.log('🍎 Purchase verified:', product);
            // Update backend based on product type
            this.handleVerifiedPurchase(product);
          })
          .finished((product: any) => {
            console.log('🍎 Purchase finished:', product);
          })
          .error((error: any) => {
            console.error('🍎 Purchase error:', error);
          });
        console.log(`🍎 Single purchase handlers set for: ${productId}`);
      } else {
        console.error(`🍎 Failed to set single purchase handler for: ${productId}`);
      }
    } catch (error) {
      console.error('🍎 Error setting up single purchase handler:', error);
    }
  }

  async getProductInfo(productId: string): Promise<any> {
    if (!shouldUseApplePayments() || !this.isInitialized || !window.store) {
      return null;
    }

    return window.store.get(productId);
  }

  private async updateBackendCredits(creditAmount: number): Promise<void> {
    try {
      console.log(`🍎 Updating ${creditAmount} credits directly via Supabase...`);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get current profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('room_credits')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Failed to get user profile: ${profileError.message}`);
      }

      const currentCredits = profile?.room_credits || 0;
      const newCredits = currentCredits + creditAmount;

      // Update credits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          room_credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update credits: ${updateError.message}`);
      }

      console.log(`🍎 Credits updated: ${currentCredits} → ${newCredits}`);
    } catch (error) {
      console.error('🍎 Error updating backend credits:', error);
      throw error;
    }
  }

  private async updateBackendSubscription(type: 'monthly' | 'annual'): Promise<void> {
    try {
      console.log(`🍎 Updating ${type} subscription directly via Supabase...`);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Calculate subscription expiry date
      const now = new Date();
      const expiryDate = new Date(now);
      if (type === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Update subscription
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_type: type,
          subscription_status: 'active',
          subscription_expires_at: expiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }

      console.log(`🍎 Subscription updated: ${type} until ${expiryDate.toISOString()}`);
    } catch (error) {
      console.error('🍎 Error updating backend subscription:', error);
      throw error;
    }
  }
}

export const appleIAP = AppleIAPService.getInstance();
