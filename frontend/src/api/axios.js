import axios from 'axios';
import toast from 'react-hot-toast';

// 1. Centralized instance configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  timeout: 20000, // 20-second request timeout limit
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request interceptor to append JWT credentials
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response interceptor with automatic retry, token expiration check, and error mapping
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // Retry settings for network failures or 5xx server exceptions
    if (config && !config._isRetryAttempt) {
      config._retryCount = config._retryCount || 0;
      const maxRetries = 3;

      const isNetworkError = !response;
      const isServerError = response && response.status >= 500;

      if ((isNetworkError || isServerError) && config._retryCount < maxRetries) {
        config._retryCount += 1;
        config._isRetryAttempt = config._retryCount >= maxRetries;
        
        // Exponential backoff delays: 1s, 2s, 4s
        const backoffDelay = Math.pow(2, config._retryCount) * 500;
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        return api(config);
      }
    }

    const status = response?.status;
    const message = response?.data?.message || 'Access denied or session expired.';

    if (status === 401) {
      // Clear local state storage on expired or invalid tokens
      localStorage.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
        // Return an unresolved promise to pause execution during redirection
        return new Promise(() => {});
      }
    } else if (status === 403) {
      toast.error(message);

      // Handle role synchronization discrepancies
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const role = (parsedUser.role || parsedUser.user?.role || '').toLowerCase();
          
          if (['admin', 'manager'].includes(role)) {
            localStorage.clear();
            setTimeout(() => {
              window.location.href = '/login?message=role_mismatch';
            }, 1500);
            return new Promise(() => {});
          }
        } catch {
          // Ignore parsing issues
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
