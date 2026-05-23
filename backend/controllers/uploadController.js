import Upload from '../models/Upload.js';
import fs from 'fs';
import path from 'path';
import { logActivity } from '../utils/auditLogger.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * @desc    Upload a single file
 * @route   POST /api/uploads
 * @access  Private
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file was uploaded.', 400));
    }

    // Construct the public URL for serving the file
    // Example: http://localhost:5000/uploads/filename.pdf
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newUpload = await Upload.create({
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path, // Full path on server disk
      uploadedBy: req.user._id,
    });

    logActivity({
      userId: req.user._id,
      action: 'File Uploaded',
      entityType: 'Upload',
      entityId: newUpload._id,
      details: `File "${newUpload.fileName}" (${(newUpload.fileSize / 1024 / 1024).toFixed(2)} MB) uploaded successfully.`,
      req,
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      id: newUpload._id,
      fileName: newUpload.fileName,
      fileUrl: newUpload.fileUrl,
      fileSize: newUpload.fileSize,
      mimeType: newUpload.mimeType,
      uploadedAt: newUpload.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an uploaded file
 * @route   DELETE /api/uploads/:id
 * @access  Private
 */
export const deleteFile = async (req, res, next) => {
  try {
    const fileRecord = await Upload.findById(req.params.id);

    if (!fileRecord) {
      return next(new AppError('File record not found.', 404));
    }

    // Authorization check: User can only delete their own uploads
    if (fileRecord.uploadedBy.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to delete this file.', 401));
    }

    // Attempt to delete file from server disk
    if (fs.existsSync(fileRecord.filePath)) {
      try {
        fs.unlinkSync(fileRecord.filePath);
      } catch (err) {
        console.error(`Failed to delete file from disk at ${fileRecord.filePath}:`, err);
        // Continue and delete from DB anyway to avoid broken entries
      }
    } else {
      console.warn(`File not found on disk at ${fileRecord.filePath}. Proceeding to delete Mongoose entry.`);
    }

    // Delete Mongoose database record
    await fileRecord.deleteOne();

    logActivity({
      userId: req.user._id,
      action: 'File Deleted',
      entityType: 'Upload',
      entityId: fileRecord._id,
      details: `File "${fileRecord.fileName}" was permanently deleted.`,
      req,
    });

    res.status(200).json({
      message: 'File removed successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
