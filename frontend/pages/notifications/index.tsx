import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification, NotificationType } from '@/utils/types';
import apiClient from '@/utils/api';
import {
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    // Filter by type
    if (selectedType !== 'all' && notification.type !== selectedType) {
      return false;
    }
    // Filter by read status
    if (showUnreadOnly && notification.read) {
      return false;
    }
    return true;
  });

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'job_update':
        return (
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        );
      case 'system':
        return (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        );
      case 'user':
        return (
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        );
      case 'alert':
        return (
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2">
            <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Handle mark as read
  const handleMarkAsRead = async (id: string) => {
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

  // Handle delete notification
  const handleDeleteNotification = async (id: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      await apiClient.delete(`/notifications/${id}`);
      
      // Refresh notifications
      await fetchNotifications();
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete notification');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get notification type label
  const getNotificationTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'job_update':
        return 'Job Update';
      case 'system':
        return 'System';
      case 'user':
        return 'User';
      case 'alert':
        return 'Alert';
      default:
        return type;
    }
  };

  // Get notification type badge variant
  const getNotificationTypeBadgeVariant = (type: NotificationType) => {
    switch (type) {
      case 'job_update':
        return 'info';
      case 'system':
        return 'default';
      case 'user':
        return 'success';
      case 'alert':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <MainLayout title="Notifications | Capstone Portal">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View and manage your notifications
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => fetchNotifications()}
              leftIcon={<ArrowPathIcon className="h-5 w-5" />}
            >
              Refresh
            </Button>
            <Button onClick={handleMarkAllAsRead}>Mark All as Read</Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Type filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedType === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedType('job_update')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedType === 'job_update'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  Job Updates
                </button>
                <button
                  onClick={() => setSelectedType('system')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedType === 'system'
                      ? 'bg-gray-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  System
                </button>
                <button
                  onClick={() => setSelectedType('user')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedType === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}
                >
                  User
                </button>
                <button
                  onClick={() => setSelectedType('alert')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedType === 'alert'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  Alerts
                </button>
              </div>
            </div>

            {/* Read status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Read Status
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="unread-only"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="unread-only" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Show unread only
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications list */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-4 rounded-md">
              {error}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start p-4 rounded-lg ${
                    !notification.read
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type as NotificationType)}
                  </div>

                  {/* Content */}
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={getNotificationTypeBadgeVariant(notification.type as NotificationType)}
                        size="sm"
                      >
                        {getNotificationTypeLabel(notification.type as NotificationType)}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="ml-3 flex-shrink-0 flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-gray-400 hover:text-primary"
                        title="Mark as read"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-gray-400 hover:text-danger"
                      title="Delete notification"
                      disabled={isDeleting}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Delete error */}
          {deleteError && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md text-sm">
              {deleteError}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;