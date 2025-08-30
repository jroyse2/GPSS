import React, { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show layout only if not authenticated
  if (user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title} | Capstone Portal</title>
        <meta name="description" content="Capstone Portal - Manufacturing Resource Planning System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and title */}
          <div className="text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-primary">Capstone Portal</h1>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manufacturing Resource Planning System
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Capstone Portal. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;