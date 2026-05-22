import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && token !== 'null' && token !== 'undefined') {
          const { data } = await api.get('/auth/me');
          if (isMounted) {
            setUser(data);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        if (isMounted) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifyUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const { data } = await api.post('/auth/signup', userData);
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    // Handle both { role: 'admin' } and { user: { role: 'admin' } } depending on user shape
    const role = (user.role || user.user?.role || '').toLowerCase();
    
    if (role === 'admin') return true;

    switch (permission) {
      case 'create-bid':
      case 'edit-bid':
        return ['sales', 'manager'].includes(role);
      case 'delete-bid':
        return false; // Admin only
      case 'manage-users':
      case 'access-settings':
      case 'access-audit-logs':
        return false; // Admin only
      case 'access-analytics':
        return role === 'manager';
      case 'approve-bid':
        return role === 'manager';
      case 'generate-ai-reports':
        return ['manager', 'sales', 'engineer'].includes(role);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, hasPermission }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
