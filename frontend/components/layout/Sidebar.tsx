import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ClockIcon,
  ScissorsIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const { user } = useAuth();

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Job Tracking', href: '/jobs', icon: ClipboardDocumentListIcon },
    { name: 'Resource Scheduling', href: '/scheduling', icon: CalendarIcon },
    { name: 'Time Management', href: '/time', icon: ClockIcon },
    { name: 'Pipe Optimization', href: '/optimization', icon: ScissorsIcon },
    { name: 'Sales Orders', href: '/orders', icon: ShoppingCartIcon },
    { name: 'Workflow Management', href: '/workflow', icon: ArrowPathIcon },
  ];

  // Admin navigation items
  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Cog6ToothIcon },
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
  ];

  // Settings and help
  const secondaryNavigation = [
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Help & Support', href: '/help', icon: QuestionMarkCircleIcon },
  ];

  // Check if a link is active
  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar - always visible on desktop (md:translate-x-0), toggleable on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-primary">Capstone Portal</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-500 dark:text-gray-400 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar content */}
        <div className="h-full overflow-y-auto py-4">
          {/* User info */}
          <div className="px-4 mb-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Logged in as</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs font-medium text-primary mt-1 capitalize">{user?.role}</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 px-2">
            {/* Main navigation */}
            <div className="mb-4">
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Main
              </p>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-primary'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Admin navigation */}
            {user?.role === 'admin' && (
              <div className="mb-4">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Administration
                </p>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-primary-light text-primary'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive(item.href)
                          ? 'text-primary'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Secondary navigation */}
            <div>
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Support
              </p>
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.href)
                        ? 'text-primary'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;