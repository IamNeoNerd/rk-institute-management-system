/**
 * Feature Flags Configuration System
 * 
 * Provides environment-based feature toggles for safe deployment and experimentation.
 * Enables gradual rollout of new features without breaking existing functionality.
 * 
 * Design Principles:
 * - Environment variable driven for easy deployment control
 * - Type-safe interfaces for development confidence
 * - Default values for graceful degradation
 * - Runtime validation for configuration errors
 * - Zero impact on existing functionality when disabled
 * 
 * Usage:
 * - Component level: useFeatureFlag('realTimeCollaboration')
 * - API level: isFeatureEnabled('advancedReporting')
 * - Conditional rendering: withFeatureFlag('mobileOptimization', Component)
 */

export interface FeatureFlags {
  // =============================================================================
  // CORE FEATURES
  // =============================================================================
  
  /** Real-time collaboration features (chat, presence, collaborative editing) */
  realTimeCollaboration: boolean;
  
  /** Advanced reporting system with custom templates and analytics */
  advancedReporting: boolean;
  
  /** AI-powered personalization and recommendations */
  aiPersonalization: boolean;
  
  /** Mobile-optimized interface and responsive design enhancements */
  mobileOptimization: boolean;
  
  // =============================================================================
  // SECURITY FEATURES
  // =============================================================================
  
  /** Two-factor authentication for enhanced security */
  twoFactorAuth: boolean;
  
  /** Comprehensive audit logging for compliance */
  auditLogging: boolean;
  
  /** Rate limiting and DDoS protection */
  rateLimiting: boolean;
  
  /** Enhanced input validation and sanitization */
  inputValidation: boolean;
  
  // =============================================================================
  // PERFORMANCE FEATURES
  // =============================================================================
  
  /** Redis-based caching for improved performance */
  caching: boolean;
  
  /** Lazy loading for components and routes */
  lazyLoading: boolean;
  
  /** Image optimization and compression */
  imageOptimization: boolean;
  
  /** Database query optimization and connection pooling */
  databaseOptimization: boolean;
  
  // =============================================================================
  // USER EXPERIENCE FEATURES
  // =============================================================================
  
  /** Dark mode theme support */
  darkMode: boolean;
  
  /** Accessibility enhancements (WCAG 2.1 AA compliance) */
  accessibilityEnhancements: boolean;
  
  /** Offline support and progressive web app features */
  offlineSupport: boolean;
  
  /** Push notifications for important updates */
  pushNotifications: boolean;
  
  // =============================================================================
  // DEVELOPMENT FEATURES
  // =============================================================================
  
  /** Beta features for testing and feedback */
  betaFeatures: boolean;
  
  /** Debug mode with enhanced logging and development tools */
  debugMode: boolean;
  
  /** Performance monitoring and analytics */
  performanceMonitoring: boolean;
  
  /** Error tracking and reporting */
  errorTracking: boolean;
  
  // =============================================================================
  // INTEGRATION FEATURES
  // =============================================================================
  
  /** Email notifications and SMTP integration */
  emailNotifications: boolean;
  
  /** SMS notifications and messaging integration */
  smsNotifications: boolean;
  
  /** Third-party API integrations */
  thirdPartyIntegrations: boolean;
  
  /** Webhook support for external systems */
  webhookSupport: boolean;
}

/**
 * Default feature flag values
 * Used as fallback when environment variables are not set
 */
const defaultFlags: FeatureFlags = {
  // Core Features - Conservative defaults
  realTimeCollaboration: false,
  advancedReporting: true,
  aiPersonalization: false,
  mobileOptimization: true,
  
  // Security Features - Enabled by default for safety
  twoFactorAuth: false,
  auditLogging: true,
  rateLimiting: true,
  inputValidation: true,
  
  // Performance Features - Enabled for better UX
  caching: true,
  lazyLoading: true,
  imageOptimization: true,
  databaseOptimization: true,
  
  // User Experience Features - Gradual rollout
  darkMode: false,
  accessibilityEnhancements: true,
  offlineSupport: false,
  pushNotifications: false,
  
  // Development Features - Environment dependent
  betaFeatures: false,
  debugMode: false,
  performanceMonitoring: true,
  errorTracking: true,
  
  // Integration Features - Disabled by default
  emailNotifications: false,
  smsNotifications: false,
  thirdPartyIntegrations: false,
  webhookSupport: false,
};

/**
 * Parse environment variable to boolean
 * Supports: 'true', '1', 'yes', 'on' as true values (case insensitive)
 */
function parseEnvBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  
  const normalizedValue = value.toLowerCase().trim();
  const trueValues = ['true', '1', 'yes', 'on', 'enabled'];
  const falseValues = ['false', '0', 'no', 'off', 'disabled'];
  
  if (trueValues.includes(normalizedValue)) return true;
  if (falseValues.includes(normalizedValue)) return false;
  
  // Log warning for invalid values
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Invalid feature flag value: ${value}. Using default: ${defaultValue}`);
  }
  
  return defaultValue;
}

/**
 * Runtime feature flags configuration
 * Reads from environment variables with fallback to defaults
 */
export const featureFlags: FeatureFlags = {
  // Core Features
  realTimeCollaboration: parseEnvBoolean(process.env.FEATURE_REALTIME, defaultFlags.realTimeCollaboration),
  advancedReporting: parseEnvBoolean(process.env.FEATURE_REPORTING, defaultFlags.advancedReporting),
  aiPersonalization: parseEnvBoolean(process.env.FEATURE_AI, defaultFlags.aiPersonalization),
  mobileOptimization: parseEnvBoolean(process.env.FEATURE_MOBILE, defaultFlags.mobileOptimization),
  
  // Security Features
  twoFactorAuth: parseEnvBoolean(process.env.FEATURE_2FA, defaultFlags.twoFactorAuth),
  auditLogging: parseEnvBoolean(process.env.FEATURE_AUDIT, defaultFlags.auditLogging),
  rateLimiting: parseEnvBoolean(process.env.FEATURE_RATE_LIMIT, defaultFlags.rateLimiting),
  inputValidation: parseEnvBoolean(process.env.FEATURE_INPUT_VALIDATION, defaultFlags.inputValidation),
  
  // Performance Features
  caching: parseEnvBoolean(process.env.FEATURE_CACHE, defaultFlags.caching),
  lazyLoading: parseEnvBoolean(process.env.FEATURE_LAZY_LOAD, defaultFlags.lazyLoading),
  imageOptimization: parseEnvBoolean(process.env.FEATURE_IMAGE_OPT, defaultFlags.imageOptimization),
  databaseOptimization: parseEnvBoolean(process.env.FEATURE_DB_OPT, defaultFlags.databaseOptimization),
  
  // User Experience Features
  darkMode: parseEnvBoolean(process.env.FEATURE_DARK_MODE, defaultFlags.darkMode),
  accessibilityEnhancements: parseEnvBoolean(process.env.FEATURE_A11Y, defaultFlags.accessibilityEnhancements),
  offlineSupport: parseEnvBoolean(process.env.FEATURE_OFFLINE, defaultFlags.offlineSupport),
  pushNotifications: parseEnvBoolean(process.env.FEATURE_PUSH, defaultFlags.pushNotifications),
  
  // Development Features
  betaFeatures: parseEnvBoolean(process.env.FEATURE_BETA, defaultFlags.betaFeatures),
  debugMode: parseEnvBoolean(process.env.FEATURE_DEBUG, process.env.NODE_ENV === 'development'),
  performanceMonitoring: parseEnvBoolean(process.env.FEATURE_PERF_MON, defaultFlags.performanceMonitoring),
  errorTracking: parseEnvBoolean(process.env.FEATURE_ERROR_TRACK, defaultFlags.errorTracking),
  
  // Integration Features
  emailNotifications: parseEnvBoolean(process.env.FEATURE_EMAIL, defaultFlags.emailNotifications),
  smsNotifications: parseEnvBoolean(process.env.FEATURE_SMS, defaultFlags.smsNotifications),
  thirdPartyIntegrations: parseEnvBoolean(process.env.FEATURE_THIRD_PARTY, defaultFlags.thirdPartyIntegrations),
  webhookSupport: parseEnvBoolean(process.env.FEATURE_WEBHOOKS, defaultFlags.webhookSupport),
};

/**
 * Check if a specific feature is enabled
 * Provides type-safe access to feature flags
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature] ?? defaultFlags[feature];
}

/**
 * Get all feature flags with their current values
 * Useful for debugging and admin interfaces
 */
export function getAllFeatureFlags(): FeatureFlags {
  return { ...featureFlags };
}

/**
 * Get feature flags that are currently enabled
 * Returns only the enabled features for analytics
 */
export function getEnabledFeatures(): Partial<FeatureFlags> {
  const enabled: Partial<FeatureFlags> = {};
  
  for (const [key, value] of Object.entries(featureFlags)) {
    if (value) {
      enabled[key as keyof FeatureFlags] = value;
    }
  }
  
  return enabled;
}

/**
 * Validate feature flag configuration
 * Checks for common configuration errors
 */
export function validateFeatureFlags(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for conflicting features
  if (featureFlags.debugMode && process.env.NODE_ENV === 'production') {
    errors.push('Debug mode should not be enabled in production');
  }
  
  if (featureFlags.betaFeatures && process.env.NODE_ENV === 'production') {
    errors.push('Beta features should not be enabled in production');
  }
  
  // Check for dependency requirements
  if (featureFlags.realTimeCollaboration && !featureFlags.caching) {
    errors.push('Real-time collaboration requires caching to be enabled');
  }
  
  if (featureFlags.pushNotifications && !featureFlags.emailNotifications) {
    errors.push('Push notifications typically require email notifications as fallback');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Feature flag analytics data
 * Tracks which features are being used
 */
export interface FeatureFlagAnalytics {
  totalFlags: number;
  enabledFlags: number;
  disabledFlags: number;
  enabledPercentage: number;
  flagsByCategory: {
    core: number;
    security: number;
    performance: number;
    userExperience: number;
    development: number;
    integration: number;
  };
}

/**
 * Get analytics data for feature flags
 * Useful for understanding feature adoption
 */
export function getFeatureFlagAnalytics(): FeatureFlagAnalytics {
  const allFlags = Object.entries(featureFlags);
  const enabledFlags = allFlags.filter(([, enabled]) => enabled);
  
  const coreFlags = ['realTimeCollaboration', 'advancedReporting', 'aiPersonalization', 'mobileOptimization'];
  const securityFlags = ['twoFactorAuth', 'auditLogging', 'rateLimiting', 'inputValidation'];
  const performanceFlags = ['caching', 'lazyLoading', 'imageOptimization', 'databaseOptimization'];
  const uxFlags = ['darkMode', 'accessibilityEnhancements', 'offlineSupport', 'pushNotifications'];
  const devFlags = ['betaFeatures', 'debugMode', 'performanceMonitoring', 'errorTracking'];
  const integrationFlags = ['emailNotifications', 'smsNotifications', 'thirdPartyIntegrations', 'webhookSupport'];
  
  return {
    totalFlags: allFlags.length,
    enabledFlags: enabledFlags.length,
    disabledFlags: allFlags.length - enabledFlags.length,
    enabledPercentage: Math.round((enabledFlags.length / allFlags.length) * 100),
    flagsByCategory: {
      core: coreFlags.filter(flag => featureFlags[flag as keyof FeatureFlags]).length,
      security: securityFlags.filter(flag => featureFlags[flag as keyof FeatureFlags]).length,
      performance: performanceFlags.filter(flag => featureFlags[flag as keyof FeatureFlags]).length,
      userExperience: uxFlags.filter(flag => featureFlags[flag as keyof FeatureFlags]).length,
      development: devFlags.filter(flag => featureFlags[flag as keyof FeatureFlags]).length,
      integration: integrationFlags.filter(flag => featureFlags[flag as keyof FeatureFlags]).length,
    }
  };
}

// Development mode validation
if (process.env.NODE_ENV === 'development') {
  const validation = validateFeatureFlags();
  if (!validation.valid) {
    console.warn('Feature flag configuration warnings:', validation.errors);
  }
  
  // Log enabled features in development
  const enabled = getEnabledFeatures();
  console.log('🚀 Enabled features:', Object.keys(enabled));
}
