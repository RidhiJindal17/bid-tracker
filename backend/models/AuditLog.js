import mongoose from 'mongoose';

/**
 * Audit Log Schema
 * Tracks all historical transactions and operations across the platform.
 */
const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Nullable for system tasks or pre-auth actions (e.g. failed login attempts)
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['Bid', 'Upload', 'User', 'AI', 'Auth', 'System'],
    },
    entityId: {
      type: String, // ID of the referenced object (Bid ID, File ID, User ID)
      required: false,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'timestamp', updatedAt: false },
  }
);

// Indexing strategy for fast query logs, searches, and timeline aggregations
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
