/**
 * Input Validation Middleware
 *
 * This module provides validation schemas and middleware for validating request data.
 * We use Joi for validation - it's beginner-friendly and has great error messages.
 *
 * Why validate input?
 * - Prevent bad data from entering the database
 * - Provide clear error messages to users
 * - Additional security layer (defense in depth)
 */

import Joi from 'joi';
import logger from '../utils/logger.js';

/**
 * Generic validation middleware factory
 *
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Which part of req to validate ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 *
 * @example
 * const schema = Joi.object({ email: Joi.string().email().required() });
 * router.post('/login', validate(schema, 'body'), loginController);
 */
export function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');

      logger.warn('Validation error:', errorMessage);

      return res.status(400).json({
        error: 'Validation failed',
        message: errorMessage,
        details: error.details
      });
    }

    // Replace request data with validated/sanitized value
    req[property] = value;

    next();
  };
}

/**
 * Validation Schemas
 *
 * Define reusable validation schemas for different resources.
 */

// News validation schema
export const newsSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('').optional(),
  image: Joi.string().allow('').optional(),
  date: Joi.date().optional()
});

// Event validation schema
export const eventSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('').optional(),
  date: Joi.date().required(),
  time: Joi.string().allow('').optional(),
  location: Joi.string().allow('').optional()
});

// Member validation schema
export const memberSchema = Joi.object({
  fname: Joi.string().min(1).max(100).required(),
  lname: Joi.string().min(1).max(100).required(),
  callsign: Joi.string().min(1).max(20).required(),
  email: Joi.string().email().required(),
  status: Joi.string().valid('bm', 'rci').required(),
  netdate: Joi.date().optional().allow(null)
});

// Exam validation schema
export const examSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('').optional(),
  date: Joi.date().required(),
  location: Joi.string().allow('').optional(),
  contact: Joi.string().allow('').optional()
});

// Link validation schema
export const linkSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  url: Joi.string().uri().required(),
  description: Joi.string().allow('').optional(),
  type: Joi.number().integer().min(1).max(3).required() // 1=Radio Clubs, 2=General Info, 3=Radio Stores
});

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Signup validation schema
export const signupSchema = Joi.object({
  fname: Joi.string().min(1).max(100).required(),
  lname: Joi.string().min(1).max(100).required(),
  callsign: Joi.string().min(1).max(20).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
  city: Joi.string().allow('').optional(),
  state: Joi.string().allow('').optional(),
  zip: Joi.string().allow('').optional()
});

// ID parameter validation
export const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export default {
  validate,
  newsSchema,
  eventSchema,
  memberSchema,
  examSchema,
  linkSchema,
  loginSchema,
  signupSchema,
  idSchema
};
