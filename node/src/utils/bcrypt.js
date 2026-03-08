/**
 * Password Hashing Utility
 *
 * This module provides secure password hashing using bcrypt.
 * NEVER store passwords in plaintext - always hash them!
 *
 * How bcrypt works:
 * - It adds a random "salt" to each password before hashing
 * - The salt makes rainbow table attacks ineffective
 * - The hash includes the salt, so we don't need to store it separately
 * - It's intentionally slow to prevent brute-force attacks
 */

import bcrypt from 'bcrypt';

/**
 * Number of salt rounds (higher = more secure but slower)
 * 10 is a good balance between security and performance
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plaintext password
 *
 * @param {string} password - The plaintext password to hash
 * @returns {Promise<string>} - The hashed password
 *
 * @example
 * const hash = await hashPassword('mySecretPassword123');
 * // Returns: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
 */
export async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a plaintext password against a hash
 *
 * @param {string} password - The plaintext password to check
 * @param {string} hash - The stored hash to compare against
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 *
 * @example
 * const isValid = await verifyPassword('mySecretPassword123', storedHash);
 * if (isValid) {
 *   console.log('Password correct!');
 * } else {
 *   console.log('Invalid password');
 * }
 */
export async function verifyPassword(password, hash) {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export default { hashPassword, verifyPassword };
