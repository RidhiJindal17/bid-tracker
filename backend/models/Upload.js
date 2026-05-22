import mongoose from 'mongoose';

/**
 * Upload Schema
 * Represents metadata of files stored on the server disk.
 */
const uploadSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
    mimeType: {
      type: String,
      trim: true,
    },
    filePath: {
      type: String,
      required: true, // Internal path on disk for deletion
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Upload = mongoose.model('Upload', uploadSchema);

export default Upload;
