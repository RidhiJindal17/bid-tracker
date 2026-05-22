import Notification from '../models/Notification.js';

/**
 * @desc    Get all notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error, failed to retrieve notifications' });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/read/:id
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error, failed to mark notification as read' });
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error, failed to mark all notifications as read' });
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check ownership
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();

    res.status(200).json({ message: 'Notification removed successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error, failed to delete notification' });
  }
};

/**
 * @desc    Create a mock notification for testing purposes
 * @route   POST /api/notifications/mock
 * @access  Private
 */
export const createMockNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    const notification = await Notification.create({
      user: req.user._id,
      title: title || 'Mock Notification',
      message: message || 'This is a mock notification generated for testing.',
      type: type || 'info',
      isRead: false
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating mock notification:', error);
    res.status(500).json({ message: 'Server error, failed to create mock notification' });
  }
};
