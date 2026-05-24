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

const missingEnv = requiredEnv.filter(
  (v) => !process.env[v]
);

if (missingEnv.length > 0) {
  console.error(
    `[CRITICAL CONFIG ERROR] Missing required environment variables: ${missingEnv.join(', ')}`
  );

  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Connect Database
connectDB();

const app = express();

// ===============================
// TRUST PROXY (IMPORTANT FOR RAILWAY)
// ===============================
app.set('trust proxy', 1);

// ===============================
// SECURITY + PERFORMANCE
// ===============================
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(mongoSanitizeExpress5);

app.use(compression());

// ===============================
// CORS CONFIGURATION
// ===============================
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) =>
      url.trim()
    )
  : [
      'http://localhost:5173',
      'http://localhost:3000',
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman / Mobile Apps / Curl
    if (!origin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*')
    ) {
      callback(null, true);
    } else {
      callback(
        new Error(
          `CORS blocked for origin: ${origin}`
        )
      );
    }
  },

  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ===============================
// BODY PARSER
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// RATE LIMITER
// ===============================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 200,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many requests from this IP. Please try again later.',
  },
});

app.use('/api', apiLimiter);

// ===============================
// STATIC UPLOADS
// ===============================
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ===============================
// API ROUTES
// ===============================
app.use('/api/auth', authRoutes);

app.use('/api/bids', bidRoutes);

app.use('/api/ai', aiRoutes);

app.use(
  '/api/notifications',
  notificationRoutes
);

app.use('/api/uploads', uploadRoutes);

app.use(
  '/api/audit-logs',
  auditLogRoutes
);

app.use('/api/users', userRoutes);

// ===============================
// ROOT HEALTH ROUTE
// ===============================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message:
      'BidSphere AI Backend Running Successfully',
    environment:
      process.env.NODE_ENV ||
      'development',
  });
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use(errorHandler);

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${PORT}`
  );
});

// ===============================
// HANDLE UNHANDLED PROMISES
// ===============================
process.on(
  'unhandledRejection',
  (reason, promise) => {
    console.error(
      '[CRITICAL SYSTEM WARNING] Unhandled Promise Rejection:',
      reason
    );
  }
);

// ===============================
// HANDLE UNCAUGHT EXCEPTIONS
// ===============================
process.on(
  'uncaughtException',
  (error) => {
    console.error(
      '[CRITICAL SYSTEM WARNING] Uncaught Exception:',
      error
    );
  }
);