import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createMockNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all notification routes
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for logged-in user
 * @access  Private
 */
router.get('/', getNotifications);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all user notifications as read
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

/**
 * @route   PUT /api/notifications/read/:id
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/read/:id', markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification by ID
 * @access  Private
 */
router.delete('/:id', deleteNotification);

/**
 * @route   POST /api/notifications/mock
 * @desc    Create a mock notification for testing
 * @access  Private
 */
router.post('/mock', createMockNotification);

export default router;
