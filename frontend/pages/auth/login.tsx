import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import routerLock from '@/utils/routerLock';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, error: authError, loading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !routerLock.isLocked()) {
      console.log('[Login] Already authenticated, redirecting to dashboard');
      routerLock.safeNavigate(router, '/dashboard');
    }
  }, [isAuthenticated, router]);
  
  const onSubmit = async (data: LoginFormData) => {
    // Clear any redirect history before login
    routerLock.clearHistory();
    
    // Attempt login
    await login(data.email, data.password);
  };
  
  return (
    <AuthLayout title="Sign In">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email input */}
        <div>
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
        </div>
        
        {/* Password input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-dark"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        {/* Auth error */}
        {authError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
            {authError}
          </div>
        )}
        
        {/* Submit button */}
        <div>
          <Button type="submit" fullWidth isLoading={loading}>
            Sign In
          </Button>
        </div>
        
        {/* Register link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;