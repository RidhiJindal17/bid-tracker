import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  FileImage, 
  X, 
  Download, 
  AlertCircle, 
  CheckCircle,
  FileCode,
  Loader2
} from 'lucide-react';
import uploadService from '../../api/uploadService';
import { toast } from 'react-hot-toast';

// Utility to format file size
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Utility to get icon matching mimetype/extension
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':
      return { icon: FileText, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    case 'doc':
    case 'docx':
      return { icon: FileText, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    case 'png':
    case 'jpg':
    case 'jpeg':
      return { icon: FileImage, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    default:
      return { icon: FileCode, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
  }
};

const FileUpload = ({ attachments = [], onChange, label = 'Attachments' }) => {
  const [uploadingFiles, setUploadingFiles] = useState({}); // { tempId: { name, progress, error } }

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Show errors for rejected files
    if (rejectedFiles && rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        const errorMsg = file.errors[0]?.message || 'Invalid file';
        toast.error(`${file.file.name}: ${errorMsg}`);
      });
    }

    if (acceptedFiles.length === 0) return;

    // Process each accepted file
    for (const file of acceptedFiles) {
      const tempId = `${Date.now()}-${Math.random()}`;
      
      // Initialize progress
      setUploadingFiles((prev) => ({
        ...prev,
        [tempId]: { name: file.name, progress: 0, error: null },
      }));

      try {
        const result = await uploadService.uploadFile(file, (progress) => {
          setUploadingFiles((prev) => {
            if (!prev[tempId]) return prev;
            return {
              ...prev,
              [tempId]: { ...prev[tempId], progress },
            };
          });
        });

        // Add successfully uploaded file details to parent form attachments state
        // Result is conforming: { id, fileName, fileUrl, fileSize }
        const newAttachment = {
          fileId: result.id, // Keep track of DB Upload ID
          fileName: result.fileName,
          fileUrl: result.fileUrl,
          fileSize: result.fileSize,
          uploadedAt: result.uploadedAt
        };

        // Sync with parent state
        onChange([...attachments, newAttachment]);

        // Remove from upload queue after slight delay for visual check
        setTimeout(() => {
          setUploadingFiles((prev) => {
            const next = { ...prev };
            delete next[tempId];
            return next;
          });
        }, 1200);

      } catch (error) {
        console.error('File upload error:', error);
        const serverError = error.response?.data?.message || 'Upload failed';
        toast.error(`Failed to upload ${file.name}: ${serverError}`);
        
        setUploadingFiles((prev) => ({
          ...prev,
          [tempId]: { ...prev[tempId], error: serverError, progress: 0 },
        }));
      }
    }
  }, [attachments, onChange]);

  // Handle deletion of an attachment
  const handleRemoveAttachment = async (index, attachment) => {
    const confirmRemove = window.confirm(`Remove attachment "${attachment.fileName}"?`);
    if (!confirmRemove) return;

    try {
      // If the file has a fileId (saved Upload document ID), call the delete API
      if (attachment.fileId) {
        await uploadService.deleteFile(attachment.fileId);
      }
      
      // Filter out from parent list
      const updatedAttachments = attachments.filter((_, idx) => idx !== index);
      onChange(updatedAttachments);
      toast.success('Attachment removed');
    } catch (error) {
      console.error('Failed to delete attachment from server:', error);
      // Even if server delete fails, we sync the state locally to allow form recovery
      const updatedAttachments = attachments.filter((_, idx) => idx !== index);
      onChange(updatedAttachments);
      toast.error('Removed locally (failed to delete server record)');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB limit matching backend
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
  });

  return (
    <div className="space-y-4.5">
      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
        {label} ({attachments.length})
      </label>

      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]'
            : 'border-slate-800 bg-[#090d1f]/30 hover:border-slate-700 hover:bg-[#090d1f]/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <motion.div
            animate={isDragActive ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
            className={`p-3 rounded-xl border ${
              isDragActive 
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
          >
            <UploadCloud className="h-6 w-6" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-slate-200">
              {isDragActive ? 'Drop the file here' : 'Drag & drop compliance documents'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, DOCX, PNG, JPG up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Queue & Completed Attachments */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {/* Active Uploads */}
          {Object.entries(uploadingFiles).map(([tempId, item]) => {
            const isCompleted = item.progress === 100;
            return (
              <motion.div
                key={tempId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#090d1f]/40 backdrop-blur-md relative overflow-hidden"
              >
                <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                  {isCompleted && !item.error ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : item.error ? (
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                    <p className="font-bold text-slate-400">{item.error ? 'Failed' : `${item.progress}%`}</p>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        item.error ? 'bg-rose-500' : isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.error && <p className="text-[10px] text-rose-400 mt-1">{item.error}</p>}
                </div>
              </motion.div>
            );
          })}

          {/* Current Saved/Uploaded Attachments */}
          {attachments.map((file, index) => {
            const config = getFileIcon(file.fileName);
            const Icon = config.icon;

            return (
              <motion.div
                key={file.fileId || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-[#090d1f]/20 backdrop-blur-sm group hover:border-slate-700/60 hover:bg-[#090d1f]/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${config.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{file.fileName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {file.fileSize ? formatBytes(file.fileSize) : 'Size unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download attachment"
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index, file)}
                    title="Remove attachment"
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/20 bg-slate-900/60 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {attachments.length === 0 && Object.keys(uploadingFiles).length === 0 && (
          <div className="text-center py-4 border border-slate-800/50 rounded-xl border-dashed bg-slate-900/5">
            <p className="text-xs text-slate-500">No attachments uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
