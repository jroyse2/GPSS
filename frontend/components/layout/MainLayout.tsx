import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title = 'Capstone Portal' }) => {
  // For mobile view only - sidebar starts closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show layout only if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Capstone Portal - Manufacturing Resource Planning System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar - always visible on desktop, toggleable on mobile */}
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Main Content - with proper margin to prevent sidebar overlap */}
        <div className="flex flex-col flex-1 md:ml-64 overflow-hidden">
          {/* Navbar */}
          <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default MainLayout;