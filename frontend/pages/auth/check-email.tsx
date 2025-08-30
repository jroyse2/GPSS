import React from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const CheckEmail: React.FC = () => {
  return (
    <AuthLayout title="Check Your Email">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="bg-primary/10 rounded-full p-4 inline-flex">
          <EnvelopeIcon className="h-12 w-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Verification email sent!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a verification email to your inbox. Please click the link in the email to verify your account.
          </p>
        </div>
        
        <div className="space-y-4 w-full">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive an email? Check your spam folder or request a new verification email.
          </p>
          
          <Button type="button" variant="outline" fullWidth>
            Resend verification email
          </Button>
          
          <div className="pt-2">
            <Link href="/auth/login" className="text-primary hover:text-primary-dark text-sm">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CheckEmail;