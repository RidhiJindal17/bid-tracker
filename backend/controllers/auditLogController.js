import AuditLog from '../models/AuditLog.js';

/**
 * @desc    Get all audit logs with search, filter, and pagination
 * @route   GET /api/audit-logs
 * @access  Private (Admin only can be enforced, or standard Private)
 */
export const getAuditLogs = async (req, res) => {
  try {
    const query = {};

    // 1. Entity Type filter
    if (req.query.entityType) {
      query.entityType = req.query.entityType;
    }

    // 2. Action filter (strict or partial match)
    if (req.query.action) {
      query.action = { $regex: req.query.action, $options: 'i' };
    }

    // 3. User filter
    if (req.query.user) {
      query.user = req.query.user;
    }

    // 4. Date range filter
    if (req.query.startDate || req.query.endDate) {
      query.timestamp = {};
      if (req.query.startDate) {
        query.timestamp.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        // Set to end of the day (23:59:59)
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    // 5. Global text search (matches action or details)
    if (req.query.search) {
      query.$or = [
        { action: { $regex: req.query.search, $options: 'i' } },
        { details: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // 6. Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Fetch matching records sorted by timestamp descending (newest first)
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      logs,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('AuditLog controller error:', error);
    res.status(500).json({ message: 'Server error, failed to retrieve audit logs.' });
  }
};
