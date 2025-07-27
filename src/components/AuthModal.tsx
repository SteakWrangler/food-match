import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onContinueWithoutAuth: () => void;
  defaultTab?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess,
  onContinueWithoutAuth,
  defaultTab = 'signin' 
}) => {
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔘 Form submission started');
    e.preventDefault();
    console.log('🔐 handleSubmit called with activeTab:', activeTab);
    console.log('🔐 Email:', email);
    console.log('🔐 Password length:', password.length);
    console.log('🔐 Form validation check...');
    
    // Check if form is valid
    if (!email || !password) {
      console.log('🔐 Form validation failed - missing email or password');
      setError('Please fill in all fields');
      return;
    }
    
    console.log('🔐 Form validation passed, setting loading...');
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (activeTab === 'signup') {
        console.log('🔐 Processing signup...');
        // Check password confirmation
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        
        // Check password length
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created successfully! A verification email has been sent to your inbox. You can use the app now, and verify your email later from settings.');
          // Allow users to continue after signup
          setTimeout(() => {
            onClose();
            onAuthSuccess?.();
          }, 3000);
        }
      } else {
        console.log('🔐 Processing signin...');
        const { error } = await signIn(email, password);
        console.log('🔐 Signin result:', { error });
        if (error) {
          setError(error.message);
        } else {
          console.log('🔐 Signin successful, closing modal');
          onClose();
          onAuthSuccess?.();
        }
      }
    } catch (err) {
      console.error('🔐 Error in handleSubmit:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      console.log('🔐 Finally block - setting loading to false');
      setLoading(false);
    }
  };



  const handleTabChange = (value: string) => {
    setActiveTab(value as 'signin' | 'signup');
    setError(null);
    setSuccess(null);
    // Clear form fields when switching tabs
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  // If user is already authenticated, close the modal immediately
  React.useEffect(() => {
    console.log('AuthModal effect - user:', user, 'authLoading:', authLoading, 'isOpen:', isOpen);
    if (user && !authLoading && isOpen) {
      console.log('User already authenticated, closing auth modal');
      onClose();
      onAuthSuccess?.();
    }
  }, [user, authLoading, isOpen, onClose, onAuthSuccess]);

  // Clear form fields when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setError(null);
      setSuccess(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Don't render the modal at all if user is already authenticated
  if (user && !authLoading) {
    console.log('User authenticated, not rendering auth modal');
    return null;
  }

  return (
    <Dialog open={isOpen && !user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader className="mb-3 sm:mb-4">
          <DialogTitle className="text-center text-lg sm:text-xl">
            {activeTab === 'signup' ? 'Create Account' : 'Sign In'}
          </DialogTitle>
        </DialogHeader>

        {authLoading ? (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600 text-sm sm:text-base">Loading...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-3 sm:space-y-4">
              <form 
                onSubmit={(e) => {
                  console.log('🔘 Form onSubmit triggered!');
                  handleSubmit(e);
                }} 
                className="space-y-3 sm:space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="button" 
                  className="w-full" 
                  disabled={loading}
                  onClick={() => {
                    console.log('🔘 Button clicked! Loading state:', loading);
                    console.log('🔘 Manually triggering form submission...');
                    handleSubmit({ preventDefault: () => {} } as any);
                  }}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 sm:space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}


      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 