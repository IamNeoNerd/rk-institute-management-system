import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// =============================================================================
// Test Environment Setup
// =============================================================================

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.clearAllTimers()
  // Reset React DOM state
  if (document.body) {
    document.body.innerHTML = ''
  }
})

beforeEach(() => {
  // Reset all mocks before each test
  vi.resetModules()
})

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
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}))

// Enhanced Next.js Image component mock
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { src, alt, width, height, ...rest } = props
    return {
      type: 'img',
      props: { src, alt, width, height, ...rest }
    }
  },
}))

// Enhanced Next.js Link component mock
vi.mock('next/link', () => ({
  default: (props: any) => {
    const { children, href, ...rest } = props
    return {
      type: 'a',
      props: { href, children, ...rest }
    }
  },
}))

// =============================================================================
// Environment Polyfills & Global Mocks
// =============================================================================

// TextEncoder/TextDecoder polyfills
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// React DOM environment setup
global.IS_REACT_ACT_ENVIRONMENT = true

// Enhanced DOM environment for React
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
    display: 'none',
    appearance: ['-webkit-appearance']
  }),
  writable: true
})

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
})

// Document selection for React DOM
Object.defineProperty(document, 'getSelection', {
  value: () => window.getSelection(),
  writable: true
})

// ActiveElement mock
Object.defineProperty(document, 'activeElement', {
  value: document.body,
  writable: true
})

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
    reload: vi.fn(),
  },
  writable: true,
})

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
    dispatchEvent: vi.fn(),
  })),
})

// Modern Observer mocks
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// =============================================================================
// Application-Specific Mocks (Enhanced)
// =============================================================================

// Enhanced Prisma Client mock
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
    student: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    fee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  })),
}))

// Enhanced environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
}

// =============================================================================
// Console Configuration (Enhanced)
// =============================================================================

const originalConsole = { ...console }

beforeEach(() => {
  // Suppress console output in tests unless explicitly needed
  console.warn = vi.fn()
  console.error = vi.fn()
  console.log = vi.fn()
})

afterEach(() => {
  // Restore console after each test
  Object.assign(console, originalConsole)
})
