/**
 * Password Migration Script
 *
 * This script migrates plaintext passwords from the legacy PHP system
 * to bcrypt-hashed passwords for the new Node.js system.
 *
 * IMPORTANT: Run this ONCE during the migration process!
 *
 * What it does:
 * 1. Adds password_hash column to passwords table (if it doesn't exist)
 * 2. Reads existing plaintext passwords
 * 3. Hashes each password with bcrypt
 * 4. Stores hashed password in password_hash column
 * 5. Optionally removes old plaintext password column (manual step)
 *
 * Usage:
 *   node src/scripts/migrate-passwords.js
 */

import { query, transaction } from '../utils/database.js';
import { hashPassword } from '../utils/bcrypt.js';
import logger from '../utils/logger.js';

async function migratePasswords() {
  try {
    logger.info('Starting password migration...');

    // Step 1: Add password_hash column if it doesn't exist
    logger.info('Step 1: Checking if password_hash column exists...');

    try {
      await query(`
        ALTER TABLE passwords
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) AFTER memberedit
      `);
      logger.success('✓ password_hash column ready');
    } catch (error) {
      // Column might already exist, which is fine
      logger.info('password_hash column already exists or error occurred:', error.message);
    }

    // Step 2: Fetch all passwords
    logger.info('Step 2: Fetching existing passwords...');

    const passwords = await query(`
      SELECT id, memberedit
      FROM passwords
      WHERE memberedit IS NOT NULL
      AND (password_hash IS NULL OR password_hash = '')
    `);

    logger.info(`Found ${passwords.length} passwords to migrate`);

    if (passwords.length === 0) {
      logger.info('No passwords to migrate. All done!');
      return;
    }

    // Step 3: Hash and update each password
    logger.info('Step 3: Hashing and updating passwords...');

    let successCount = 0;
    let errorCount = 0;

    for (const row of passwords) {
      try {
        // Hash the plaintext password
        const hash = await hashPassword(row.memberedit);

        // Update the database
        await query(
          `UPDATE passwords SET password_hash = ? WHERE id = ?`,
          [hash, row.id]
        );

        successCount++;
        logger.info(`✓ Migrated password for user ID ${row.id}`);
      } catch (error) {
        errorCount++;
        logger.error(`✗ Failed to migrate password for user ID ${row.id}:`, error.message);
      }
    }

    // Summary
    logger.success(`
==================================================
Password Migration Complete!
==================================================
Total passwords:    ${passwords.length}
Successfully hashed: ${successCount}
Errors:             ${errorCount}
==================================================

NEXT STEPS:
1. Verify that all passwords were migrated successfully
2. Test logging in with the new system
3. Once confirmed, you can manually drop the old 'memberedit' column:
   ALTER TABLE passwords DROP COLUMN memberedit;

WARNING: Do NOT drop the old column until you've verified
the new authentication system works correctly!
    `);

  } catch (error) {
    logger.error('Password migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the migration
migratePasswords();
