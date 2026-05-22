import mongoose from 'mongoose';

/**
 * Bid Status Constants
 */
export const BID_STATUSES = {
  NEW_ENQUIRY: 'New Enquiry',
  UNDER_REVIEW: 'Under Review',
  QUOTATION_SENT: 'Quotation Sent',
  NEGOTIATION: 'Negotiation',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ORDER_PROCESSING: 'Order Processing',
  COMPLETED: 'Completed',
};

/**
 * Bid Priority Constants
 */
export const BID_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

/**
 * Attachment Schema (Sub-document)
 */
const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required'],
    },
  },
  {
    timestamps: { createdAt: 'uploadedAt', updatedAt: false },
  }
);

/**
 * Activity Log Schema (Sub-document)
 */
const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User performing action is required'],
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

/**
 * Bid Schema for MongoDB
 */
const bidSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a bid title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    clientName: {
      type: String,
      required: [true, 'Please add a client name'],
      trim: true,
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a bid description'],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Please add a bid value'],
      min: [0, 'Bid value cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(BID_STATUSES),
        message: '{VALUE} is not a valid bid status',
      },
      default: BID_STATUSES.NEW_ENQUIRY,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(BID_PRIORITIES),
        message: '{VALUE} is not a valid priority',
      },
      default: BID_PRIORITIES.MEDIUM,
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify a bid deadline'],
      validate: {
        validator: function (value) {
          if (this.isNew || this.isModified('deadline')) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const valDate = new Date(value);
            valDate.setHours(0, 0, 0, 0);
            return valDate >= today;
          }
          return true;
        },
        message: 'Deadline cannot be a past date',
      },
    },
    assignedTo: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A bid must have at least one assigned team member.',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [attachmentSchema],
    activityLogs: [activityLogSchema],
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXING STRATEGY
// ==========================================

// 1. Text indexing for flexible search (title, client name, description)
bidSchema.index({
  title: 'text',
  clientName: 'text',
  description: 'text',
});

// 2. Single-field Indexes to optimize dashboard filtering and pipeline views
bidSchema.index({ status: 1 });
bidSchema.index({ priority: 1 });
bidSchema.index({ assignedTo: 1 });
bidSchema.index({ createdBy: 1 });

// 3. Compound Index to optimize deadline management within specific status pipelines
bidSchema.index({ status: 1, deadline: 1 });

// 4. Compound Index to optimize sorting by value and filter by status
bidSchema.index({ status: 1, value: -1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
