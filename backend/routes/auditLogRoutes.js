import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect and admin role check middleware
router.use(protect);
router.use(checkRole('admin'));

/**
 * @route   GET /api/audit-logs
 * @desc    Fetch list of audit transaction logs
 * @access  Private (Admin Only)
 */
router.get('/', getAuditLogs);

export default router;
