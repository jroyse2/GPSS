import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { format } from 'date-fns';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead, loading } = useNotifications();

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

  // Handle mark as read
  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job_update':
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-blue-600" />
          </div>
        );
      case 'system':
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-gray-600" />
          </div>
        );
      case 'user':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-green-600" />
          </div>
        );
      case 'alert':
        return (
          <div className="bg-red-100 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-red-600" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-xs text-primary hover:text-primary-dark"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <Link
              href="/notifications"
              key={notification.id}
              className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={onClose}
            >
              <div className="flex items-start">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>

                {/* Mark as read button */}
                {!notification.read && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="ml-2 text-gray-400 hover:text-primary"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/notifications"
          className="block text-sm text-center text-primary hover:text-primary-dark"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;