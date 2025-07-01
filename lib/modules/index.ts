/**
 * Module Registration
 * 
 * Central registration point for all application modules.
 * Registers core system modules and feature modules with proper
 * dependency management and feature flag integration.
 * 
 * Module Categories:
 * - Core: Essential system functionality
 * - Feature: Business logic modules
 * - Integration: External service integrations
 * - Experimental: Beta/testing features
 */

import { moduleRegistry } from './ModuleRegistry';
import { isFeatureEnabled } from '@/lib/config/FeatureFlags';

/**
 * Register all application modules
 * Called during application initialization
 */
export function registerModules(): void {
  console.log('🚀 Registering application modules...');

  try {
    // Register core modules first (no dependencies)
    registerCoreModules();
    
    // Register feature modules (depend on core)
    registerFeatureModules();
    
    // Register integration modules
    registerIntegrationModules();
    
    // Register experimental modules
    registerExperimentalModules();

    console.log('✅ All modules registered successfully');
    
    // Log module statistics
    const stats = moduleRegistry.getStatistics();
    console.log(`📊 Module Statistics:`, {
      total: stats.total,
      enabled: stats.enabled,
      disabled: stats.disabled,
      errors: stats.errors,
      categories: stats.byCategory,
    });

  } catch (error) {
    console.error('❌ Failed to register modules:', error);
    throw error;
  }
}

/**
 * Register core system modules
 * These modules provide essential functionality and have no dependencies
 */
function registerCoreModules(): void {
  // Core system module
  moduleRegistry.register({
    name: 'core',
    version: '1.0.0',
    description: 'Core system functionality including authentication, database, and utilities',
    dependencies: [],
    routes: [
      '/api/health',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/verify',
    ],
    components: [
      'Layout',
      'Navigation',
      'Header',
      'Footer',
      'LoadingSpinner',
      'ErrorBoundary',
    ],
    services: [
      'AuthService',
      'DatabaseService',
      'LoggingService',
      'ConfigService',
    ],
    enabled: true,
    category: 'core',
    priority: 100,
    author: 'RK Institute',
    license: 'PROPRIETARY',
    requirements: {
      nodeVersion: '>=18.0.0',
      memoryMB: 64,
      features: ['database', 'authentication'],
    },
  });

  // Security module
  moduleRegistry.register({
    name: 'security',
    version: '1.0.0',
    description: 'Security features including input validation, rate limiting, and audit logging',
    dependencies: ['core'],
    routes: [
      '/api/security/audit',
      '/api/security/rate-limit',
    ],
    components: [
      'SecurityProvider',
      'ProtectedRoute',
      'AuditLog',
    ],
    services: [
      'SecurityService',
      'AuditService',
      'ValidationService',
    ],
    enabled: isFeatureEnabled('auditLogging') || isFeatureEnabled('rateLimiting'),
    requiredFeatures: [],
    optionalFeatures: ['auditLogging', 'rateLimiting', 'inputValidation'],
    category: 'core',
    priority: 90,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });

  // UI/UX module
  moduleRegistry.register({
    name: 'ui-framework',
    version: '1.0.0',
    description: 'UI framework with components, themes, and responsive design',
    dependencies: ['core'],
    routes: [],
    components: [
      'Button',
      'Input',
      'Modal',
      'Table',
      'Card',
      'Form',
      'ThemeProvider',
      'ResponsiveContainer',
    ],
    services: [
      'ThemeService',
      'ResponsiveService',
    ],
    enabled: true,
    optionalFeatures: ['darkMode', 'accessibilityEnhancements', 'mobileOptimization'],
    category: 'core',
    priority: 80,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });
}

/**
 * Register feature modules
 * These modules provide business functionality and depend on core modules
 */
function registerFeatureModules(): void {
  // Student Management module
  moduleRegistry.register({
    name: 'student-management',
    version: '1.0.0',
    description: 'Complete student lifecycle management including enrollment, profiles, and family relationships',
    dependencies: ['core', 'ui-framework'],
    routes: [
      '/api/students',
      '/api/students/[id]',
      '/api/families',
      '/api/families/[id]',
      '/api/students/search',
      '/api/students/bulk',
    ],
    components: [
      'StudentList',
      'StudentForm',
      'StudentProfile',
      'FamilyForm',
      'FamilyProfile',
      'StudentSearch',
      'BulkStudentActions',
    ],
    services: [
      'StudentService',
      'FamilyService',
      'EnrollmentService',
    ],
    enabled: true,
    category: 'feature',
    priority: 70,
    author: 'RK Institute',
    license: 'PROPRIETARY',
    requirements: {
      memoryMB: 32,
      features: ['database'],
    },
  });

  // Fee Management module
  moduleRegistry.register({
    name: 'fee-management',
    version: '1.0.0',
    description: 'Comprehensive fee and payment management system',
    dependencies: ['core', 'student-management', 'ui-framework'],
    routes: [
      '/api/fees',
      '/api/fees/[id]',
      '/api/payments',
      '/api/payments/[id]',
      '/api/fee-structures',
      '/api/discounts',
    ],
    components: [
      'FeeList',
      'FeeForm',
      'PaymentForm',
      'PaymentHistory',
      'FeeStructureManager',
      'DiscountManager',
      'InvoiceGenerator',
    ],
    services: [
      'FeeService',
      'PaymentService',
      'InvoiceService',
      'DiscountService',
    ],
    enabled: true,
    category: 'feature',
    priority: 60,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });

  // Course Management module
  moduleRegistry.register({
    name: 'course-management',
    version: '1.0.0',
    description: 'Course and curriculum management with scheduling',
    dependencies: ['core', 'student-management', 'ui-framework'],
    routes: [
      '/api/courses',
      '/api/courses/[id]',
      '/api/schedules',
      '/api/enrollments',
    ],
    components: [
      'CourseList',
      'CourseForm',
      'ScheduleManager',
      'EnrollmentManager',
      'CourseCalendar',
    ],
    services: [
      'CourseService',
      'ScheduleService',
      'EnrollmentService',
    ],
    enabled: true,
    category: 'feature',
    priority: 50,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });

  // Reporting module
  moduleRegistry.register({
    name: 'reporting',
    version: '1.0.0',
    description: 'Advanced reporting and analytics system',
    dependencies: ['core', 'student-management', 'fee-management'],
    routes: [
      '/api/reports',
      '/api/reports/generate',
      '/api/reports/templates',
      '/api/analytics',
    ],
    components: [
      'ReportGenerator',
      'ReportViewer',
      'ReportHistory',
      'AnalyticsDashboard',
      'ChartComponents',
    ],
    services: [
      'ReportService',
      'AnalyticsService',
      'ExportService',
    ],
    enabled: isFeatureEnabled('advancedReporting'),
    requiredFeatures: ['advancedReporting'],
    category: 'feature',
    priority: 40,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });
}

/**
 * Register integration modules
 * These modules provide external service integrations
 */
function registerIntegrationModules(): void {
  // Communication module
  moduleRegistry.register({
    name: 'communication',
    version: '1.0.0',
    description: 'Email, SMS, and notification management',
    dependencies: ['core', 'student-management'],
    routes: [
      '/api/notifications',
      '/api/email',
      '/api/sms',
      '/api/templates',
    ],
    components: [
      'NotificationCenter',
      'EmailComposer',
      'SMSComposer',
      'TemplateManager',
      'CommunicationHistory',
    ],
    services: [
      'EmailService',
      'SMSService',
      'NotificationService',
      'TemplateService',
    ],
    enabled: isFeatureEnabled('emailNotifications') || isFeatureEnabled('smsNotifications'),
    optionalFeatures: ['emailNotifications', 'smsNotifications', 'pushNotifications'],
    category: 'integration',
    priority: 30,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });

  // Third-party integrations
  moduleRegistry.register({
    name: 'third-party-integrations',
    version: '1.0.0',
    description: 'External API integrations and webhook support',
    dependencies: ['core'],
    routes: [
      '/api/webhooks',
      '/api/integrations',
      '/api/sync',
    ],
    components: [
      'IntegrationManager',
      'WebhookManager',
      'SyncStatus',
      'APIKeyManager',
    ],
    services: [
      'WebhookService',
      'IntegrationService',
      'SyncService',
    ],
    enabled: isFeatureEnabled('thirdPartyIntegrations') || isFeatureEnabled('webhookSupport'),
    optionalFeatures: ['thirdPartyIntegrations', 'webhookSupport'],
    category: 'integration',
    priority: 20,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });
}

/**
 * Register experimental modules
 * These modules are in beta/testing phase
 */
function registerExperimentalModules(): void {
  // Real-time collaboration
  moduleRegistry.register({
    name: 'realtime-collaboration',
    version: '0.9.0',
    description: 'Real-time collaboration features including chat, presence, and collaborative editing',
    dependencies: ['core', 'student-management'],
    routes: [
      '/api/collaboration',
      '/api/presence',
      '/api/chat',
    ],
    components: [
      'CollaborationPanel',
      'PresenceIndicator',
      'ChatInterface',
      'CollaborativeEditor',
    ],
    services: [
      'CollaborationService',
      'PresenceService',
      'ChatService',
    ],
    enabled: isFeatureEnabled('realTimeCollaboration'),
    requiredFeatures: ['realTimeCollaboration'],
    optionalFeatures: ['caching'],
    category: 'experimental',
    priority: 10,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });

  // AI Personalization
  moduleRegistry.register({
    name: 'ai-personalization',
    version: '0.8.0',
    description: 'AI-powered personalization and recommendations',
    dependencies: ['core', 'student-management', 'reporting'],
    routes: [
      '/api/ai/recommendations',
      '/api/ai/insights',
      '/api/ai/personalization',
    ],
    components: [
      'RecommendationEngine',
      'PersonalizationPanel',
      'AIInsights',
      'SmartSuggestions',
    ],
    services: [
      'AIService',
      'RecommendationService',
      'PersonalizationService',
    ],
    enabled: isFeatureEnabled('aiPersonalization'),
    requiredFeatures: ['aiPersonalization'],
    category: 'experimental',
    priority: 5,
    author: 'RK Institute',
    license: 'PROPRIETARY',
  });
}

/**
 * Get module status summary
 */
export function getModuleStatus(): {
  registry: typeof moduleRegistry;
  statistics: ReturnType<typeof moduleRegistry.getStatistics>;
  enabledModules: string[];
  disabledModules: string[];
  errorModules: string[];
} {
  const stats = moduleRegistry.getStatistics();
  const allModules = moduleRegistry.getAllModules();
  
  const enabledModules = allModules
    .filter(m => m.config.enabled && m.status === 'loaded')
    .map(m => m.config.name);
    
  const disabledModules = allModules
    .filter(m => !m.config.enabled || m.status === 'disabled')
    .map(m => m.config.name);
    
  const errorModules = allModules
    .filter(m => m.status === 'error')
    .map(m => m.config.name);

  return {
    registry: moduleRegistry,
    statistics: stats,
    enabledModules,
    disabledModules,
    errorModules,
  };
}

// Export the registry for external use
export { moduleRegistry };
