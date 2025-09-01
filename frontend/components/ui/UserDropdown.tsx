import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface UserDropdownProps {
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ onClose }) => {
  const { user, logout } = useAuth();

  // Handle click outside to close dropdown
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle logout
  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
        <p className="text-xs font-medium text-primary mt-1 capitalize">
          {user?.user_metadata?.role || 'user'}
        </p>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <Link
          href="/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
          Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" />
          Settings
        </Link>
      </div>

      {/* Logout */}
      <div className="py-1 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;