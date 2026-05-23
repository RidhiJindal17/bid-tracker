import mongoose from 'mongoose';

/**
 * Notification Schema for MongoDB.
 * Keeps track of user-specific notifications for the Bid Tracking platform.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Index for faster lookup of user notifications
    },
    title: {
      type: String,
      required: [true, 'Please add a notification title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please add a notification message'],
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'bid_update'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Will automatically handle createdAt and updatedAt
  }
);

// Compound Index to optimize fetching user-specific notifications (unread first, sorted chronologically)
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
