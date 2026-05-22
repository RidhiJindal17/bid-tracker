import express from 'express';
import { 
  getTeamMembers, 
  addTeamMember, 
  updateTeamMember, 
  deleteTeamMember,
  getTeamPerformance,
  getTeamActivities,
  getOnlineUsersCount
} from '../controllers/userController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to protect all team management routes
router.use(protect);

router.get('/', getTeamMembers);
router.get('/online-count', getOnlineUsersCount);
router.post('/', checkRole('admin'), addTeamMember);
router.get('/performance', checkRole('admin', 'manager'), getTeamPerformance);
router.get('/activities', checkRole('admin', 'manager'), getTeamActivities);
router.put('/:id', checkRole('admin'), updateTeamMember);
router.delete('/:id', checkRole('admin'), deleteTeamMember);

export default router;
