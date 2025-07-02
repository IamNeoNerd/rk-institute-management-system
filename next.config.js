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
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // Experimental features for better performance
  experimental: {
    // Optimize server components
    serverComponentsExternalPackages: ['@prisma/client'],

    // Enable optimized CSS loading
    optimizeCss: true,

    // Enable modern bundle optimization
    optimizePackageImports: ['lucide-react', '@prisma/client']

    // Enable turbo mode for faster builds (commented out - not stable in Next.js 14)
    // turbo: {
    //   rules: {
    //     '*.svg': {
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //   },
    // },
  },

  // =============================================================================
  // PERFORMANCE OPTIMIZATIONS - ADVANCED
  // =============================================================================

  // Compression
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Power by header removal for security
  poweredByHeader: false,

  // =============================================================================
  // WEBPACK CONFIGURATION
  // =============================================================================

  webpack: (config, { isServer, dev }) => {
    // Handle Prisma client and other server-only modules
    if (isServer) {
      config.externals.push('@prisma/client');
    }

    // Performance optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true;

      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true
          }
        }
      };

      // Enable module concatenation
      config.optimization.concatenateModules = true;
    }

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true
        })
      );
    }

    return config;
  },

  // =============================================================================
  // TYPESCRIPT & ESLINT CONFIGURATION
  // =============================================================================

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false
  },

  // =============================================================================
  // PRODUCTION LOGGING
  // =============================================================================

  // Disable source maps in production for security
  productionBrowserSourceMaps: false
};

module.exports = nextConfig;
