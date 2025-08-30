import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AuthError: React.FC = () => {
  const router = useRouter();
  const { error } = router.query;
  
  // Define error messages based on error code
  const getErrorMessage = () => {
    switch (error) {
      case 'verification_failed':
        return 'Your verification link is invalid or has expired.';
      case 'email_not_confirmed':
        return 'Your email has not been confirmed yet.';
      case 'invalid_credentials':
        return 'Invalid email or password.';
      default:
        return 'An authentication error occurred.';
    }
  };
  
  return (
    <AuthLayout title="Authentication Error">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 inline-flex">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Authentication Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {getErrorMessage()}
          </p>
        </div>
        
        <div className="space-y-4 w-full">
          {error === 'verification_failed' && (
            <Button 
              type="button" 
              variant="outline" 
              fullWidth
              onClick={() => router.push('/auth/forgot-password')}
            >
              Request a new verification link
            </Button>
          )}
          
          <div className="pt-2">
            <Link href="/auth/login" className="text-primary hover:text-primary-dark">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default AuthError;