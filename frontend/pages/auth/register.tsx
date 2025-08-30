import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { register: registerUser, error: authError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data.username, data.email, data.password);
  };
  
  return (
    <AuthLayout title="Create an Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Username input */}
        <div>
          <Input
            label="Username"
            type="text"
            autoComplete="username"
            leftIcon={<UserIcon className="h-5 w-5 text-gray-400" />}
            error={errors.username?.message}
            {...register('username', {
              required: 'Username is required',
              minLength: {
                value: 3,
                message: 'Username must be at least 3 characters',
              },
            })}
          />
        </div>
        
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
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        
        {/* Confirm Password input */}
        <div>
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            leftIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
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
            Create Account
          </Button>
        </div>
        
        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary-dark font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;