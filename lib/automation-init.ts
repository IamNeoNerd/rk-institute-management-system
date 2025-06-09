/**
 * Automation Initialization
 * Initialize the automation engine and scheduler when the application starts
 */

import SchedulerService from './services/scheduler.service';

let isInitialized = false;

export function initializeAutomation() {
  if (isInitialized) {
    console.log('[Automation Init] Already initialized, skipping...');
    return;
  }

  try {
    console.log('[Automation Init] Starting automation system...');
    
    // Initialize the scheduler service
    SchedulerService.initialize();
    
    isInitialized = true;
    console.log('[Automation Init] ✅ Automation system initialized successfully');
    
  } catch (error) {
    console.error('[Automation Init] ❌ Failed to initialize automation system:', error);
  }
}

export function shutdownAutomation() {
  if (!isInitialized) {
    console.log('[Automation Init] Not initialized, skipping shutdown...');
    return;
  }

  try {
    console.log('[Automation Init] Shutting down automation system...');
    
    // Shutdown the scheduler service
    SchedulerService.shutdown();
    
    isInitialized = false;
    console.log('[Automation Init] ✅ Automation system shutdown complete');
    
  } catch (error) {
    console.error('[Automation Init] ❌ Failed to shutdown automation system:', error);
  }
}

// Auto-initialize in production environment
if (process.env.NODE_ENV === 'production') {
  // Small delay to ensure all modules are loaded
  setTimeout(() => {
    initializeAutomation();
  }, 1000);
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', shutdownAutomation);
  process.on('SIGINT', shutdownAutomation);
}
