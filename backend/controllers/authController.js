import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { logActivity } from '../utils/auditLogger.js';

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
export const signup = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Validate Input Parameters
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Normalize email (lowercase, strip trailing spaces, etc.)
    const cleanEmail = validator.normalizeEmail(email);

    // Check if user exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
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
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
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

      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
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
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all users (for assignment selection)
 * @route   GET /api/auth/users
 * @access  Private
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

