import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/utils/supabase/client';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();
  
  const password = watch('password');
  
  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) throw error;
      
      // Redirect to login page
      router.push('/auth/login?reset=success');
    } catch (error: any) {
      console.error('Password reset failed:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout title="Reset Password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password input */}
        <div>
          <div className="relative">
            <Input
              label="New Password"
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
            label="Confirm New Password"
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
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {/* Submit button */}
        <div>
          <Button type="submit" fullWidth isLoading={loading}>
            Reset Password
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;