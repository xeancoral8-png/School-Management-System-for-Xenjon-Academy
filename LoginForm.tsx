import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, User, Lock, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import academyLogo from 'figma:asset/423041854a274a303b5abe317732e0f5a6e9a89f.png';

type LoginFormProps = {
  onLogin: (user: any) => void;
  onSignUp: () => void;
};

export function LoginForm({ onLogin, onSignUp }: LoginFormProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = JSON.parse(localStorage.getItem('xenjonUsers') || '[]');
      
      const user = users.find((u: any) => 
        (u.username === credentials.username || u.email === credentials.username) && 
        u.password === credentials.password
      );

      if (user) {
        toast.success(`Welcome back, ${user.firstName}! 🎉`);
        onLogin(user);
      } else {
        setError('Invalid username or password. Please try again.');
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseAdmin = () => {
    setCredentials({
      username: 'Admin123',
      password: 'Admin123!'
    });
    toast.info('Admin credentials loaded! Click Login to continue.');
  };

  const handleUseFaculty = () => {
    setCredentials({
      username: 'JSmith456',
      password: 'Faculty123!'
    });
    toast.info('Faculty credentials loaded! Click Login to continue.');
  };

  const handleUseStudent = () => {
    setCredentials({
      username: 'EJones789',
      password: 'Student123!'
    });
    toast.info('Student credentials loaded! Click Login to continue.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Academy Logo */}
        <div className="text-center">
          <img 
            src={academyLogo}
            alt="Xenjon Academy Logo" 
            className="w-32 h-32 mx-auto object-contain"
          />
          <div className="mt-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Xenjon Academy</h1>
            <p className="text-gray-600 dark:text-gray-300">Management System</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-6 pb-6">
            {/* Welcome Back Section */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-300">Sign in to your account to continue</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="Enter your username or email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Quick Access</span>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseAdmin}
                  className="text-xs"
                >
                  Use Admin
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseFaculty}
                    className="text-xs"
                  >
                    Use Faculty
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseStudent}
                    className="text-xs"
                  >
                    Use Student
                  </Button>
                </div>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                    Don't have an account?
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                onClick={onSignUp}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create New Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 Xenjon Academy. All rights reserved.</p>
          <p className="mt-1">Secure Login System</p>
        </div>
      </div>
    </div>
  );
}