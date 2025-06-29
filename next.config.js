/** @type {import('next').NextConfig} */

// =============================================================================
// RK Institute Management System - Production Optimized Configuration v2.0
// =============================================================================

const nextConfig = {
  // =============================================================================
  // PRODUCTION OPTIMIZATIONS
  // =============================================================================

  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Output configuration for standalone deployment
  output: 'standalone',

  // Compress responses
  compress: true,

  // =============================================================================
  // SECURITY CONFIGURATION
  // =============================================================================

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Ensure consistent URL structure
  trailingSlash: false,

  // =============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // =============================================================================

  // Image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for better performance
  experimental: {
    // Optimize server components
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // =============================================================================
  // WEBPACK CONFIGURATION
  // =============================================================================

  webpack: (config, { isServer }) => {
    // Handle Prisma client and other server-only modules
    if (isServer) {
      config.externals.push('@prisma/client');
    }

    return config;
  },

  // =============================================================================
  // TYPESCRIPT & ESLINT CONFIGURATION
  // =============================================================================

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // =============================================================================
  // PRODUCTION LOGGING
  // =============================================================================

  // Disable source maps in production for security
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig
