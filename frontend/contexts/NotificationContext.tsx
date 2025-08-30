import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import apiClient from '@/utils/api';
import { useAuth } from './AuthContext';

// Notification interface
interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Notification context interface
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider props
interface NotificationProviderProps {
  children: ReactNode;
}

// Notification provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Listen for socket events
  useEffect(() => {
    if (socket && user) {
      // Listen for new notifications
      socket.on('notification:received', (data) => {
        if (data.userId === user.id) {
          // Add new notification to state
          setNotifications((prev) => [data.notification, ...prev]);
          // Increment unread count
          setUnreadCount((prev) => prev + 1);
        }
      });

      // Listen for read notifications
      socket.on('notification:read', (data) => {
        if (data.userId === user.id) {
          // Update notification in state
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === data.notificationId
                ? { ...notification, read: true }
                : notification
            )
          );
          // Decrement unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      });

      // Listen for all read notifications
      socket.on('notification:all-read', (data) => {
        if (data.userId === user.id) {
          // Mark all notifications as read
          setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, read: true }))
          );
          // Reset unread count
          setUnreadCount(0);
        }
      });

      // Listen for deleted notifications
      socket.on('notification:deleted', (data) => {
        if (data.userId === user.id) {
          // Remove notification from state
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== data.notificationId)
          );
          // Update unread count
          fetchUnreadCount();
        }
      });
    }

    // Clean up listeners on unmount
    return () => {
      if (socket) {
        socket.off('notification:received');
        socket.off('notification:read');
        socket.off('notification:all-read');
        socket.off('notification:deleted');
      }
    };
  }, [socket, user]);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/notifications');
      setNotifications(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      setError(error.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      setUnreadCount(response.data.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);

      // Update notification in state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );

      // Update unread count
      fetchUnreadCount();
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');

      // Mark all notifications as read in state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};