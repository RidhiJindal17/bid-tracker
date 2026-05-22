import AuditLog from '../models/AuditLog.js';

/**
 * Utility helper to write audit logs to MongoDB.
 * Executed asynchronously to avoid blocking user thread.
 * 
 * @param {Object} logParams
 * @param {String} logParams.userId - ID of the user performing the action (optional)
 * @param {String} logParams.action - Action label (e.g. "Bid Created")
 * @param {String} logParams.entityType - Target entity classification ('Bid' | 'Upload' | 'User' | 'AI' | 'Auth' | 'System')
 * @param {String} logParams.entityId - Primary identifier of the affected document (optional)
 * @param {String} logParams.details - Contextual descriptions
 * @param {Object} logParams.req - Express Request object to extract IP address (optional)
 */
export const logActivity = async ({ userId, action, entityType, entityId, details, req = null }) => {
  try {
    // Extract IP address from request headers or socket info
    let ipAddress = 'Unknown';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
      if (ipAddress.includes('::ffff:')) {
        ipAddress = ipAddress.split('::ffff:')[1];
      }
    }

    await AuditLog.create({
      user: userId || null,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('[AUDIT LOGGER ERROR] Failed to record transaction log:', error);
  }
};
