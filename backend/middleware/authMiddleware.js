import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from './errorMiddleware.js';

/**
 * Middleware to protect routes. 
 * Checks for a JWT token in the Authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new AppError('Not authorized, user not found', 401));
      }

      // Update lastActive timestamp
      await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });

      next();
    } catch (error) {
      console.error('[AUTH ERROR] JWT verification failed:', error.message);
      next(error);
    }
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }
};

// verifyToken alias for compliance with security specs
export const verifyToken = protect;

/**
 * Middleware to enforce role-based access control (RBAC).
 * Matches user roles against allowed lists.
 * 
 * @param {...String} roles - Allowed list of roles (e.g. 'admin', 'manager')
 */
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.warn('[AUTH WARNING] Access attempted without user context.');
      return next(new AppError('Not authorized, no user context', 401));
    }
    
    const userRole = (req.user.role || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      console.warn(`[AUTH FORBIDDEN] User "${req.user.name}" (${req.user.email}) with role "${req.user.role}" attempted to access path "${req.originalUrl || req.path}" but was blocked. Allowed roles: ${roles.join(', ')}`);
      return next(new AppError(`Access denied. Role '${req.user.role}' is not authorized to perform this action.`, 403));
    }
    
    console.info(`[AUTH GRANTED] User "${req.user.name}" (${req.user.role}) accessed path "${req.originalUrl || req.path}"`);
    next();
  };
};
