import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { logActivity } from '../utils/auditLogger.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Generate a JWT token for a given user ID.
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id: id.toString(), role: (role || '').toLowerCase() },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body;

    // Validate Input Parameters
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return next(new AppError('Name is required', 400));
    }

    if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Normalize email (lowercase, strip trailing spaces, etc.)
    const cleanEmail = validator.normalizeEmail(email);

    // Check if user exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return next(new AppError('User already exists', 400));
    }

    // Create user
    const user = await User.create({
      name: validator.escape(name.trim()), // Sanitize user inputs to prevent XSS
      email: cleanEmail,
      password,
      role: role || 'user',
    });

    if (user) {
      logActivity({
        userId: user._id,
        action: 'User Registered',
        entityType: 'Auth',
        entityId: user._id,
        details: `User account "${user.name}" (${user.email}) registered with role ${user.role}.`,
        req,
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      return next(new AppError('Invalid user data', 400));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    const cleanEmail = validator.normalizeEmail(email);

    // Find user by email
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (user && (await user.matchPassword(password))) {
      logActivity({
        userId: user._id,
        action: 'User Logged In',
        entityType: 'Auth',
        entityId: user._id,
        details: `User "${user.name}" logged in successfully.`,
        req,
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      const attemptedUser = await User.findOne({ email: cleanEmail });
      logActivity({
        userId: attemptedUser ? attemptedUser._id : null,
        action: 'Login Failed',
        entityType: 'Auth',
        details: `Failed credentials login attempt for email: ${cleanEmail}`,
        req,
      });

      return next(new AppError('Invalid email or password', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      return next(new AppError('User not found', 404));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (for assignment selection)
 * @route   GET /api/auth/users
 * @access  Private
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('name email role');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

