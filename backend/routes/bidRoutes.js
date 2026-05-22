import express from 'express';
import {
  createBid,
  getBids,
  getBidById,
  updateBid,
  deleteBid,
  getDashboardAnalytics,
} from '../controllers/bidController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All Bid routes are protected by the JWT authentication middleware.
 */
router.use(protect);

router.get('/analytics/dashboard', getDashboardAnalytics);

/**
 * @route   POST /api/bids
 * @desc    Create a new bid
 * @access  Private (Admin, Manager, Sales)
 * 
 * @route   GET /api/bids
 * @desc    Get all bids with pagination, filtering, search, and sorting
 * @access  Private
 */
router.route('/')
  .post(checkRole('admin', 'manager', 'sales'), createBid)
  .get(getBids);

/**
 * @route   GET /api/bids/:id
 * @desc    Get a single bid by ID
 * @access  Private
 * 
 * @route   PUT /api/bids/:id
 * @desc    Update a bid by ID
 * @access  Private
 * 
 * @route   DELETE /api/bids/:id
 * @desc    Delete a bid by ID
 * @access  Private (Admin or Manager only)
 */
router.route('/:id')
  .get(getBidById)
  .put(updateBid)
  .delete(checkRole('admin', 'manager'), deleteBid);

export default router;
