/**
 * Member Status Type Constants
 *
 * These constants define the different member status types used throughout the application.
 * Centralizing them here prevents typos and makes the code more maintainable.
 */

/**
 * Status types for members
 */
export const STATUS_TYPES = {
  BEARS_MEMBER: 'bm',           // Official BEARS club member
  REGULAR_CHECK_IN: 'rci'       // Regular check-in (not a full member)
};

/**
 * Human-readable labels for status types
 */
export const STATUS_LABELS = {
  [STATUS_TYPES.BEARS_MEMBER]: 'Bears Member',
  [STATUS_TYPES.REGULAR_CHECK_IN]: 'Regular Check-In'
};

/**
 * Get label for a status type
 *
 * @param {string} status - Status code ('bm' or 'rci')
 * @returns {string} Human-readable label
 */
export function getStatusLabel(status) {
  return STATUS_LABELS[status] || 'Unknown';
}

/**
 * Validate status type
 *
 * @param {string} status - Status code to validate
 * @returns {boolean} True if valid status type
 */
export function isValidStatus(status) {
  return Object.values(STATUS_TYPES).includes(status);
}

export default {
  STATUS_TYPES,
  STATUS_LABELS,
  getStatusLabel,
  isValidStatus
};
