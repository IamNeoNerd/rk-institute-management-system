// Global polyfills for SSR compatibility
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  global.self = global;
}

if (typeof globalThis !== 'undefined' && typeof self === 'undefined') {
  globalThis.self = globalThis;
}

// Additional browser API polyfills for server-side rendering
if (typeof window === 'undefined') {
  global.window = {};
  global.document = {};
  global.navigator = {};
  global.location = {};
}
