import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }

    const success = await login(username, password);

    if (success) {
      toast({
        title: 'Welcome back!',
        description: 'Login successful',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-admin relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center px-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl gradient-pool flex items-center justify-center">
              <Waves className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary-foreground">PEH</h1>
              <p className="text-primary-foreground/70">Welcome to Peace Empire Hotel, Pool, Conference/Villas POS</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Streamline Your Operations
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Manage your pool, conference halls, and hotel rooms all in one place.
            Efficient booking, seamless payments, and powerful analytics.
          </p>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur">
              <div className="h-10 w-10 rounded-lg gradient-pool flex items-center justify-center mb-3">
                <Waves className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-primary-foreground font-medium">Pool</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur">
              <div className="h-10 w-10 rounded-lg gradient-conference flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-primary-foreground font-medium">Conference Hall</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4 backdrop-blur">
              <div className="h-10 w-10 rounded-lg gradient-hotel flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="text-primary-foreground font-medium">Hotel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo with same heading */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-8 text-center">
            <div className="h-16 w-16 rounded-xl gradient-pool flex items-center justify-center">
              <Waves className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PEH</h1>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Welcome to Peace Empire Hotel, Pool, Conference/Villas POS
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 gradient-pool border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              {/* Demo credentials - Update with your actual credentials */}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}