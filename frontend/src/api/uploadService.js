import api from './axios';

/**
 * Upload Service API Layer
 * Connects the frontend to backend Multer file upload routes.
 */
const uploadService = {
  /**
   * Upload a single file with progress tracking
   * @param {File} file - File object from input/dropzone
   * @param {Function} onProgress - Progress callback function (percentage) => {}
   */
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return data;
  },

  /**
   * Delete an uploaded file by ID
   * @param {String} id - Upload record ID
   */
  deleteFile: async (id) => {
    const { data } = await api.delete(`/uploads/${id}`);
    return data;
  },
};

export default uploadService;
