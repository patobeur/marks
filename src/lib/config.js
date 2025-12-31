/**
 * Config.js
 * Centralized configuration and constants for the Bookmark Cleaner extension.
 */
const Config = {
  // Application checks
  DEBUG: true,
  VERSION: '1.0.0',

  // Duplicate Detection Settings
  DUPLICATE_CRITERIA: {
    URL: 'url',
    TITLE: 'title'
  },

  // Homepage Settings
  HOMEPAGE: {
    MAX_RECENT_ITEMS: 10,
    MAX_TOP_SITES: 10
  },

  // UI Settings
  ANIMATION_DURATION: 300, // ms

  // Keys for Storage
  STORAGE_KEYS: {
    SETTINGS: 'user_settings',
    STATS: 'usage_stats'
  },

  // Default User Settings
  DEFAULT_SETTINGS: {
    language: 'fr',
    theme: 'system', // or 'light', 'dark'
    confirmDeletions: true,
    scanMode: 'url' // 'url' or 'strict' (url + title)
  }
};

// Export for ES modules or global scope depending on context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Config;
} else {
  window.Config = Config;
}
