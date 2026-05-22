import express from 'express';
import { uploadFile, deleteFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload, handleMulterError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply protect middleware to all upload routes
router.use(protect);

/**
 * @route   POST /api/uploads
 * @desc    Upload a single file (PDF, DOC, DOCX, PNG, JPG/JPEG)
 * @access  Private
 */
router.post('/', upload.single('file'), handleMulterError, uploadFile);

/**
 * @route   DELETE /api/uploads/:id
 * @desc    Delete an uploaded file by ID
 * @access  Private
 */
router.delete('/:id', deleteFile);

export default router;
