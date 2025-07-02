// =============================================================================
// CRITICAL: React 18+ DOM APIs - MUST BE FIRST, BEFORE ANY IMPORTS
// Based on Context 7 research: React DOM accesses these during module loading
// =============================================================================

// Ensure window exists (jsdom should provide this)
if (typeof window === 'undefined') {
  throw new Error(
    'jsdom environment not properly initialized - window is undefined'
  );
}

// CRITICAL: React 18+ Event Priority System - SINGLE DEFINITION
// React DOM calls this during module initialization
Object.defineProperty(window, 'getCurrentEventPriority', {
  value: () => 3, // NormalPriority - matches React's priority system
  writable: true,
  configurable: true
});

// CRITICAL: React 18+ Active Element Deep API - SINGLE DEFINITION
// React DOM calls this during focus management
Object.defineProperty(window, 'getActiveElementDeep', {
  value: () => document.activeElement || document.body,
  writable: true,
  configurable: true
});

// CRITICAL: Animation Frame APIs for React 18+ time slicing - SINGLE DEFINITION
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16);
  },
  writable: true,
  configurable: true
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: (id: number) => clearTimeout(id),
  writable: true,
  configurable: true
});

// CRITICAL: MessageChannel for React Scheduler - SINGLE DEFINITION
Object.defineProperty(window, 'MessageChannel', {
  value: class MessageChannel {
    port1 = {
      onmessage: null,
      postMessage: () => {},
      start: () => {},
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    port2 = {
      onmessage: null,
      postMessage: () => {},
      start: () => {},
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  },
  writable: true,
  configurable: true
});

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// React Hook testing environment
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// React Concurrent Features support
Object.defineProperty(global, 'scheduler', {
  value: {
    unstable_scheduleCallback: vi.fn(),
    unstable_cancelCallback: vi.fn(),
    unstable_shouldYield: vi.fn(() => false),
    unstable_requestPaint: vi.fn(),
    unstable_now: vi.fn(() => Date.now()),
    unstable_getCurrentPriorityLevel: vi.fn(() => 3),
    unstable_ImmediatePriority: 1,
    unstable_UserBlockingPriority: 2,
    unstable_NormalPriority: 3,
    unstable_LowPriority: 4,
    unstable_IdlePriority: 5
  },
  writable: true
});

// =============================================================================
// ADDITIONAL DOM API POLYFILLS
// Based on Context 7 research and industry best practices for React 18+ testing
// =============================================================================

// Additional DOM APIs that React components may need
if (typeof window !== 'undefined') {
  // Selection API (CRITICAL for React DOM focus management)
  if (!window.getSelection) {
    Object.defineProperty(window, 'getSelection', {
      value: () => ({
        rangeCount: 0,
        addRange: vi.fn(),
        removeAllRanges: vi.fn(),
        toString: () => '',
        getRangeAt: vi.fn(() => ({
          startContainer: document.body,
          endContainer: document.body,
          startOffset: 0,
          endOffset: 0
        }))
      }),
      writable: true,
      configurable: true
    });
  }

  // Observer APIs (HIGH PRIORITY for modern React components)
  if (!window.ResizeObserver) {
    Object.defineProperty(window, 'ResizeObserver', {
      value: class ResizeObserver {
        constructor(callback: any) {}
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
      writable: true,
      configurable: true
    });
  }

  if (!window.IntersectionObserver) {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: class IntersectionObserver {
        constructor(callback: any, options?: any) {}
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        root = null;
        rootMargin = '0px';
        thresholds = [0];
      },
      writable: true,
      configurable: true
    });
  }

  if (!window.MutationObserver) {
    Object.defineProperty(window, 'MutationObserver', {
      value: class MutationObserver {
        constructor(callback: any) {}
        observe = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
      },
      writable: true,
      configurable: true
    });
  }

  // Performance API (MEDIUM PRIORITY for React DevTools)
  if (!window.performance) {
    Object.defineProperty(window, 'performance', {
      value: {
        now: () => Date.now(),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        timing: {},
        navigation: {}
      },
      writable: true,
      configurable: true
    });
  }

  // Crypto API (MEDIUM PRIORITY for React key generation)
  if (!window.crypto) {
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: (arr: any) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        },
        randomUUID: () =>
          'test-uuid-' + Math.random().toString(36).substr(2, 9),
        subtle: {}
      },
      writable: true,
      configurable: true
    });
  }

  // Storage APIs (LOW PRIORITY but commonly used)
  if (!window.localStorage) {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null)
      },
      writable: true,
      configurable: true
    });
  }

  if (!window.sessionStorage) {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(() => null)
      },
      writable: true,
      configurable: true
    });
  }
}

// =============================================================================
// Test Environment Setup
// =============================================================================

afterEach(async () => {
  cleanup();
  vi.clearAllMocks();
  vi.clearAllTimers();

  // Complete React DOM cleanup
  if (document.body) {
    document.body.innerHTML = '';
  }

  // Reset React DOM state
  if (
    typeof window !== 'undefined' &&
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__
  ) {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null;
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = null;
  }

  // Clear React Scheduler state
  if (typeof window !== 'undefined' && window.MessageChannel) {
    const channel = new window.MessageChannel();
    channel.port1.onmessage = null;
    channel.port2.onmessage = null;
  }

  // Reset focus state
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur?.();
  }

  // Reset Module Registry singleton state (using same pattern as integration tests)
  try {
    const { moduleRegistry } = await import('@/lib/modules/ModuleRegistry');
    if (moduleRegistry && typeof moduleRegistry.clear === 'function') {
      moduleRegistry.clear();
    }
  } catch (error) {
    // Module registry not available, skip reset
  }

  // Reset all module-related global state
  Object.keys(global).forEach(key => {
    if (
      key.startsWith('__MODULE_') ||
      key.startsWith('__REGISTRY_') ||
      key.startsWith('__FEATURE_') ||
      key.startsWith('__CORE_MODULE_')
    ) {
      delete (global as any)[key];
    }
  });
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.resetModules();
});

// =============================================================================
// Next.js 14 App Router Mocks (Enhanced)
// =============================================================================

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn()
}));

// Enhanced Next.js Image component mock
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { src, alt, width, height, ...rest } = props;
    return {
      type: 'img',
      props: { src, alt, width, height, ...rest }
    };
  }
}));

// Enhanced Next.js Link component mock
vi.mock('next/link', () => ({
  default: (props: any) => {
    const { children, href, ...rest } = props;
    return {
      type: 'a',
      props: { href, children, ...rest }
    };
  }
}));

// =============================================================================
// Environment Polyfills & Global Mocks
// =============================================================================

// TextEncoder/TextDecoder polyfills
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// React DOM environment setup
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// Ensure window is available before React DOM initialization
if (typeof window === 'undefined') {
  // This should not happen with jsdom, but let's be safe
  throw new Error(
    'Window object not available - jsdom environment not properly initialized'
  );
}

// Enhanced DOM environment for React
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    display: 'none',
    appearance: ['-webkit-appearance']
  }),
  writable: true
});

// Selection API mock for React DOM
Object.defineProperty(window, 'getSelection', {
  value: () => ({
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
    toString: () => '',
    rangeCount: 0,
    anchorNode: null,
    anchorOffset: 0,
    focusNode: null,
    focusOffset: 0,
    isCollapsed: true,
    type: 'None'
  }),
  writable: true
});

// Document selection for React DOM
Object.defineProperty(document, 'getSelection', {
  value: () => window.getSelection(),
  writable: true
});

// ActiveElement mock
Object.defineProperty(document, 'activeElement', {
  value: document.body,
  writable: true
});

// =============================================================================
// React Environment Infrastructure (Phase A.1)
// =============================================================================

// React DOM Event System
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true
});

// React DOM Focus Management
Object.defineProperty(window, 'focus', {
  value: vi.fn(),
  writable: true
});

Object.defineProperty(window, 'blur', {
  value: vi.fn(),
  writable: true
});

// React DOM Scheduler APIs
Object.defineProperty(window, 'scheduler', {
  value: {
    unstable_scheduleCallback: vi.fn(),
    unstable_cancelCallback: vi.fn(),
    unstable_shouldYield: vi.fn(() => false),
    unstable_requestPaint: vi.fn(),
    unstable_now: vi.fn(() => Date.now()),
    unstable_getCurrentPriorityLevel: vi.fn(() => 3),
    unstable_ImmediatePriority: 1,
    unstable_UserBlockingPriority: 2,
    unstable_NormalPriority: 3,
    unstable_LowPriority: 4,
    unstable_IdlePriority: 5
  },
  writable: true
});

// Enhanced window.location mock
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  },
  writable: true
});

// Enhanced matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Modern Observer mocks
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// =============================================================================
// Application-Specific Mocks (Enhanced)
// =============================================================================

// Note: Prisma Client mocking is now handled per-test in individual test files
// This allows for more sophisticated mock implementations that can simulate
// real business logic and database behavior

// Enhanced environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test'
};

// =============================================================================
// Console Configuration (Enhanced)
// =============================================================================

const originalConsole = { ...console };

beforeEach(() => {
  // Suppress console output in tests unless explicitly needed
  console.warn = vi.fn();
  console.error = vi.fn();
  console.log = vi.fn();
});

afterEach(() => {
  // Restore console after each test
  Object.assign(console, originalConsole);
});
