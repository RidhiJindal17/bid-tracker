import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { mongoSanitizeExpress5 } from './middleware/sanitizeMiddleware.js';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnv = requiredEnv.filter((v) => !process.env[v]);
if (missingEnv.length > 0) {
  console.error(`[CRITICAL CONFIG ERROR] Missing required environment variables: ${missingEnv.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Connect to Database
connectDB();

const app = express();

/**
 * Global Optimization & Security Middleware
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allows secure cross-origin asset loading
}));
app.use(mongoSanitizeExpress5); // Prevent NoSQL Injection attacks (Express 5 compatible)
app.use(compression()); // Gzip compression for smaller payload footprints

const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim()) 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Enable secure Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON data

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', apiLimiter); // Apply rate limiter to all API endpoints

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);

// Centralized error handler
app.use(errorHandler);

// Serve built static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res, next) => {
    // Let API routes flow to their handlers
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
} else {
  // Root endpoint
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Production process crash safeguards
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL SYSTEM WARNING] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[CRITICAL SYSTEM WARNING] Uncaught Exception thrown:', error);
});
