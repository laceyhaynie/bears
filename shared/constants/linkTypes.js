/**
 * Link Type Constants
 *
 * The links table categorizes external resources into three types.
 * These constants ensure consistency across the application.
 */

/**
 * Link type identifiers
 */
export const LINK_TYPES = {
  RADIO_CLUBS: 1,      // Other ham radio clubs
  GENERAL_INFO: 2,     // General ham radio information and resources
  RADIO_STORES: 3      // Stores selling radio equipment
};

/**
 * Human-readable labels for link types
 */
export const LINK_TYPE_LABELS = {
  [LINK_TYPES.RADIO_CLUBS]: 'Radio Clubs',
  [LINK_TYPES.GENERAL_INFO]: 'General Information',
  [LINK_TYPES.RADIO_STORES]: 'Radio Stores'
};

/**
 * Get label for a link type
 *
 * @param {number} type - Link type ID (1, 2, or 3)
 * @returns {string} Human-readable label
 */
export function getLinkTypeLabel(type) {
  return LINK_TYPE_LABELS[type] || 'Other';
}

/**
 * Validate link type
 *
 * @param {number} type - Link type to validate
 * @returns {boolean} True if valid link type
 */
export function isValidLinkType(type) {
  return Object.values(LINK_TYPES).includes(type);
}

/**
 * Get all link types as array (useful for dropdowns)
 *
 * @returns {Array<{value: number, label: string}>}
 */
export function getLinkTypeOptions() {
  return Object.entries(LINK_TYPE_LABELS).map(([value, label]) => ({
    value: parseInt(value),
    label
  }));
}

export default {
  LINK_TYPES,
  LINK_TYPE_LABELS,
  getLinkTypeLabel,
  isValidLinkType,
  getLinkTypeOptions
};
