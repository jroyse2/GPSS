import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <>
      <Head>
        <title>Unauthorized | Capstone Portal</title>
        <meta name="description" content="Unauthorized access - Capstone Portal" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full p-4 inline-flex">
              <ShieldExclamationIcon className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Access Denied
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                You don't have permission to access this page.
              </p>
              
              {user && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Current role: {user.user_metadata?.role || 'No role assigned'}
                </p>
              )}
            </div>
            
            <div className="pt-6 space-y-4">
              <Button 
                type="button"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
              
              <div className="pt-2">
                <Link href="/dashboard" className="text-primary hover:text-primary-dark block">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;