/**
 * BEARS Website - Backend API Server
 *
 * This is the main entry point for the Express.js backend.
 * It sets up middleware, routes, and starts the server.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import dotenv from 'dotenv';

import { testConnection } from './utils/database.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes (will be created in Phase 2)
// import newsRoutes from './routes/news.js';
// import eventsRoutes from './routes/events.js';
// import membersRoutes from './routes/members.js';
// import examsRoutes from './routes/exams.js';
// import linksRoutes from './routes/links.js';
// import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * MIDDLEWARE SETUP
 *
 * Order matters! Middleware is executed in the order it's registered.
 */

// 1. Security headers (prevents common vulnerabilities)
app.use(helmet());

// 2. CORS - Allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow cookies to be sent
}));

// 3. Rate limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// 4. Body parsing - Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Session management - Store user login sessions in MySQL
const MySQLStoreSession = MySQLStore(session);

const sessionStore = new MySQLStoreSession({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000, // Clean up expired sessions every 15 minutes
  expiration: 86400000 // Session expires after 24 hours
});

app.use(session({
  key: 'bears_session',
  secret: process.env.SESSION_SECRET || 'default-secret-change-this-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true, // Prevents client-side JS from reading the cookie (XSS protection)
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS only)
    sameSite: 'lax' // CSRF protection
  }
}));

/**
 * ROUTES
 *
 * All API routes are prefixed with /api
 */

// Health check endpoint (no authentication required)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test database connection endpoint
app.get('/api/health/db', async (req, res) => {
  const isConnected = await testConnection();
  res.json({
    database: isConnected ? 'connected' : 'disconnected'
  });
});

// TODO: Register route modules here in Phase 2
// app.use('/api/news', newsRoutes);
// app.use('/api/events', eventsRoutes);
// app.use('/api/members', membersRoutes);
// app.use('/api/exams', examsRoutes);
// app.use('/api/links', linksRoutes);
// app.use('/api/auth', authRoutes);

/**
 * ERROR HANDLING
 *
 * These must be registered AFTER all routes
 */

// 404 handler - catches requests to non-existent routes
app.use(notFoundHandler);

// Global error handler - catches all errors from routes/middleware
app.use(errorHandler);

/**
 * START SERVER
 */
async function startServer() {
  try {
    // Test database connection before starting server
    logger.info('Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('Failed to connect to database. Please check your .env file.');
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.success(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      logger.info('Press Ctrl+C to stop the server');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();
