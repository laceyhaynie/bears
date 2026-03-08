/**
 * Database Utility Module
 *
 * This module provides a secure connection to the MySQL database using connection pooling.
 * All queries use parameterized statements to prevent SQL injection attacks.
 *
 * Why we use this pattern:
 * - Connection pooling improves performance by reusing database connections
 * - Parameterized queries (using ?) prevent SQL injection vulnerabilities
 * - Promise-based API makes async/await code cleaner
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * MySQL connection pool
 *
 * A pool maintains multiple database connections that can be reused,
 * which is much more efficient than creating a new connection for each query.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,        // Maximum number of connections in the pool
  queueLimit: 0,              // No limit on queued connection requests
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Execute a parameterized SQL query
 *
 * IMPORTANT: Always use parameterized queries to prevent SQL injection!
 *
 * @param {string} sql - SQL query with ? placeholders for parameters
 * @param {Array} params - Array of values to substitute for ? placeholders
 * @returns {Promise<Array>} - Query results
 *
 * @example
 * // SAFE - Using parameterized query
 * const results = await query(
 *   'SELECT * FROM members WHERE status = ?',
 *   ['bm']
 * );
 *
 * @example
 * // UNSAFE - NEVER DO THIS (vulnerable to SQL injection)
 * const results = await query(
 *   `SELECT * FROM members WHERE status = '${status}'`
 * );
 */
export async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a transaction (multiple queries that must all succeed or all fail)
 *
 * @param {Function} callback - Async function that receives a connection and performs queries
 * @returns {Promise<any>} - Result from the callback function
 *
 * @example
 * await transaction(async (conn) => {
 *   await conn.query('INSERT INTO news (title) VALUES (?)', ['New Item']);
 *   await conn.query('INSERT INTO images (news_id) VALUES (?)', [newsId]);
 * });
 */
export async function transaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Test database connection
 *
 * @returns {Promise<boolean>} - True if connection successful
 */
export async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}

// Default export for convenience
export default { query, transaction, testConnection };
