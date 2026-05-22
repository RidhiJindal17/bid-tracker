import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include JWT token
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

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Access denied or session expired.';

    if (status === 401) {
      // Handle unauthorized error (e.g., redirect to login or clear storage)
      localStorage.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
        // Return an unresolved promise to pause execution during redirection,
        // which completely silences "Uncaught (in promise)" console errors.
        return new Promise(() => {});
      }
    } else if (status === 403) {
      // Handle forbidden error gracefully
      toast.error(message);

      // Detect role mismatch or stale session (e.g. client role says admin/manager but got 403)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const role = (parsedUser.role || parsedUser.user?.role || '').toLowerCase();
          
          if (['admin', 'manager'].includes(role)) {
            // Role mismatch detected. Clear storage and force fresh login.
            localStorage.clear();
            setTimeout(() => {
              window.location.href = '/login?message=role_mismatch';
            }, 1500);
            return new Promise(() => {});
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
