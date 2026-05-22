import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../api/notificationService';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      // Only toast on manual loading or critical failures, not silent polls
      if (!silent) {
        toast.error('Failed to load notifications');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  // Fetch on mount or when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Set up polling interval for new notifications (e.g., every 30 seconds)
      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 30000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast.error('Failed to mark notification as read');
      // Revert on error
      fetchNotifications(true);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    if (unreadCount === 0) return;

    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to update notifications');
      fetchNotifications(true);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete notification');
      fetchNotifications(true);
    }
  };

  // Create a mock notification for testing
  const createMockNotification = async (mockData = {}) => {
    try {
      const defaultMocks = [
        {
          title: 'AI Bid Extraction Complete',
          message: 'Gemini successfully parsed request for RFQ-2026-X. Found 14 compliance criteria.',
          type: 'success',
        },
        {
          title: 'Bid Deadline Approaching',
          message: 'The submission window for "Gov-Tech Portal Upgrade" closes in 24 hours. Submit now.',
          type: 'warning',
        },
        {
          title: 'Compliance Gap Alert',
          message: 'AI detected a potential gap in insurance certificates for the "City Transit Bid".',
          type: 'error',
        },
        {
          title: 'New Team Member Assigned',
          message: 'Sarah Jenkins has been assigned as Lead Compliancy officer on your current bid draft.',
          type: 'info',
        },
        {
          title: 'Bid Status Updated',
          message: 'Bid status for "Enterprise Cloud Migration" changed from "Draft" to "Review".',
          type: 'bid_update',
        }
      ];

      // Pick a random mock if no data is provided
      const randomMock = defaultMocks[Math.floor(Math.random() * defaultMocks.length)];
      const payload = {
        title: mockData.title || randomMock.title,
        message: mockData.message || randomMock.message,
        type: mockData.type || randomMock.type,
      };

      const newNotification = await notificationService.createMockNotification(payload);
      
      // Prepend the new notification to local state
      setNotifications((prev) => [newNotification, ...prev]);
      toast.success('Test notification generated!');
      return newNotification;
    } catch (err) {
      console.error('Failed to create mock notification:', err);
      toast.error('Failed to create test notification');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        createMockNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
