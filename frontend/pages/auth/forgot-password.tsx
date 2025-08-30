import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AuthLayout from '@/components/layout/AuthLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/utils/supabase/client';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (error: any) {
      console.error('Password reset request failed:', error);
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout title="Forgot Password">
      {success ? (
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="bg-primary/10 rounded-full p-4 inline-flex">
            <EnvelopeIcon className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Check your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a password reset link to your email address. Please check your inbox.
            </p>
          </div>
          
          <div className="pt-4">
            <Link href="/auth/login" className="text-primary hover:text-primary-dark">
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
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
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <div>
            <Button type="submit" fullWidth isLoading={loading}>
              Send Reset Link
            </Button>
          </div>
          
          {/* Back to login */}
          <div className="text-center">
            <Link href="/auth/login" className="text-primary hover:text-primary-dark text-sm">
              Back to login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;