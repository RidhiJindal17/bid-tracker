import api from './axios';

/**
 * Notification Service API Layer
 * Connects the React application to the backend notification endpoints.
 */
const notificationService = {
  /**
   * Fetch all notifications for the authenticated user
   */
  getNotifications: async () => {
    const { data } = await api.get('/notifications');
    return data;
  },

  /**
   * Mark a single notification as read
   * @param {String} id - Notification ID
   */
  markAsRead: async (id) => {
    const { data } = await api.put(`/notifications/read/${id}`);
    return data;
  },

  /**
   * Mark all notifications as read for the user
   */
  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  /**
   * Delete a notification
   * @param {String} id - Notification ID
   */
  deleteNotification: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  /**
   * Generate a mock notification for user testing
   * @param {Object} notificationData - { title, message, type }
   */
  createMockNotification: async (notificationData = {}) => {
    const { data } = await api.post('/notifications/mock', notificationData);
    return data;
  },
};

export default notificationService;
