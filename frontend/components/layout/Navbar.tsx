import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import NotificationDropdown from '../ui/NotificationDropdown';
import UserDropdown from '../ui/UserDropdown';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 md:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile menu button - only visible on mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Page title/breadcrumb area */}
            <div className="ml-4 md:ml-0">
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                {/* This could be dynamic based on current page */}
                Capstone Portal
              </h1>
            </div>
          </div>

          {/* Right side navigation items */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="text-gray-600 dark:text-gray-300 focus:outline-none relative"
                aria-label="Notifications"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {notificationsOpen && (
                <NotificationDropdown onClose={() => setNotificationsOpen(false)} />
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-gray-600 dark:text-gray-300 focus:outline-none"
                aria-label="User menu"
              >
                <UserCircleIcon className="h-8 w-8 mr-1" />
                <span className="hidden md:block">{user?.username}</span>
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <UserDropdown onClose={() => setUserMenuOpen(false)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;