/**
 * Authentication Middleware
 *
 * This middleware checks if a user is logged in by verifying their session.
 * Use this on routes that require any authenticated user.
 *
 * How sessions work:
 * 1. User logs in successfully
 * 2. Server creates session and stores userId in req.session
 * 3. Session ID is sent to browser as HttpOnly cookie
 * 4. Browser automatically sends cookie with every request
 * 5. express-session reads cookie and loads session data into req.session
 * 6. This middleware checks if req.session.userId exists
 */

import { query } from '../utils/database.js';
import logger from '../utils/logger.js';

/**
 * Middleware to check if user is authenticated
 *
 * If the user is authenticated, their user data is attached to req.user
 * and the request continues to the next middleware/route handler.
 *
 * If not authenticated, returns 401 Unauthorized.
 *
 * @example
 * // Protect a route
 * router.get('/api/admin/dashboard', authenticate, (req, res) => {
 *   res.json({ message: 'Welcome, admin!', user: req.user });
 * });
 */
export async function authenticate(req, res, next) {
  try {
    // Check if session exists and has userId
    if (!req.session || !req.session.userId) {
      logger.warn('Unauthorized access attempt - no session');
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    // Fetch user data from database
    const users = await query(
      'SELECT id, username, email FROM passwords WHERE id = ?',
      [req.session.userId]
    );

    // Check if user still exists in database
    if (users.length === 0) {
      logger.warn(`User ${req.session.userId} not found in database`);

      // Clear invalid session
      req.session.destroy();

      return res.status(401).json({
        error: 'User not found',
        message: 'Your account may have been deleted. Please log in again.'
      });
    }

    // Attach user data to request object for use in route handlers
    req.user = users[0];

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * Optional authentication middleware
 *
 * Unlike authenticate(), this doesn't return 401 if not logged in.
 * Instead, it attaches user data if available, or sets req.user to null.
 *
 * Use this when you want to show different content for logged-in users,
 * but still allow anonymous access.
 *
 * @example
 * router.get('/api/news', optionalAuthenticate, (req, res) => {
 *   if (req.user) {
 *     // Show draft articles for logged-in admins
 *   } else {
 *     // Show only published articles
 *   }
 * });
 */
export async function optionalAuthenticate(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      const users = await query(
        'SELECT id, username, email FROM passwords WHERE id = ?',
        [req.session.userId]
      );

      req.user = users.length > 0 ? users[0] : null;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
}

export default authenticate;
