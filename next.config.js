/** @type {import('next').NextConfig} */

// =============================================================================
// RK Institute Management System - Production Next.js Configuration
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
  
  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // Static assets caching for performance
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // API routes with appropriate caching
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300' // 5 minutes cache for API responses
          }
        ]
      }
    ]
  },

  // Content Security Policy
  // Note: rewrites function is defined later in the file

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

  // Experimental features for better performance (Phase 2 optimizations)
  experimental: {
    // Enable modern bundling
    esmExternals: true,

    // Optimize server components
    serverComponentsExternalPackages: ['@prisma/client'],

    // Phase 2: Advanced performance optimizations
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@prisma/client', 'react-hook-form'],

    // Enable turbo mode for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },

    // Phase 2: Memory and performance improvements
    workerThreads: false,
    cpus: Math.max(1, (require('os').cpus().length || 1) - 1),
  },

  // =============================================================================
  // WEBPACK CONFIGURATION
  // =============================================================================
  
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Development server optimizations (Phase 1 carryover)
    if (dev) {
      // Optimize file watching for better development performance
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/coverage']
      };

      // Reduce memory usage in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    // Production optimizations (Phase 2)
    if (!dev) {
      // Minimize bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }

      // Add bundle analyzer in production (optional)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        )
      }
    }

    // Enhanced SSR Compatibility (Simplified approach - Phase 3 Critical Fix)
    if (isServer) {
      // Only externalize truly server-incompatible dependencies
      config.externals.push(
        '@prisma/client',
        'html2canvas',
        'jspdf'
      );

      // Critical fix: Add banner to define self globally
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: 'if (typeof self === "undefined") { var self = global; }',
          raw: true,
          entryOnly: false,
        })
      );
    } else {
      // Enhanced client-side fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }

    // Enhanced global polyfills with comprehensive environment detection (Phase 3 Critical Fix)
    config.plugins.push(
      new webpack.DefinePlugin({
        'typeof window': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof self': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof global': isServer ? JSON.stringify('object') : JSON.stringify('object'),
        'typeof document': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof navigator': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof location': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        // Critical fix: Define self as global on server-side
        'self': isServer ? 'global' : 'self',
      })
    );

    return config
  },

  // =============================================================================
  // ENVIRONMENT CONFIGURATION
  // =============================================================================
  
  // Environment variables to expose to the client
  env: {
    // Add any client-side environment variables here if needed
  },

  // Public runtime configuration
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },

  // Server runtime configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: process.env.JWT_SECRET,
  },

  // =============================================================================
  // REDIRECTS AND REWRITES
  // =============================================================================

  // Redirects for SEO and user experience
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
    ]
  },

  // Custom page exclusions for build process
  async rewrites() {
    return {
      beforeFiles: [
        // Force dynamic rendering for problematic routes
        {
          source: '/admin/people',
          destination: '/admin/people',
          has: [
            {
              type: 'header',
              key: 'x-force-dynamic',
              value: 'true',
            },
          ],
        },
      ],
      afterFiles: [
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
      fallback: [],
    }
  },

  // =============================================================================
  // INTERNATIONALIZATION (if needed)
  // =============================================================================
  
  // i18n: {
  //   locales: ['en', 'es', 'fr'],
  //   defaultLocale: 'en',
  // },

  // =============================================================================
  // BUILD CONFIGURATION (Critical Vendor Bundle Fix)
  // =============================================================================

  // Force dynamic rendering for problematic routes
  async generateBuildId() {
    return 'rk-institute-' + Date.now();
  },

  // =============================================================================
  // TYPESCRIPT CONFIGURATION
  // =============================================================================

  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. (Not recommended for production)
    ignoreBuildErrors: false,
  },

  // =============================================================================
  // ESLINT CONFIGURATION
  // =============================================================================
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. (Not recommended for production)
    ignoreDuringBuilds: false,
  },

  // =============================================================================
  // POWEREDBY HEADER
  // =============================================================================
  
  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // =============================================================================
  // TRAILING SLASH
  // =============================================================================
  
  // Ensure consistent URL structure
  trailingSlash: false,

  // =============================================================================
  // ASSET PREFIX (for CDN)
  // =============================================================================
  
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.yourdomain.com' : '',

  // =============================================================================
  // CUSTOM SERVER (if needed)
  // =============================================================================
  
  // distDir: 'build',
  // generateEtags: false,
  // onDemandEntries: {
  //   maxInactiveAge: 25 * 1000,
  //   pagesBufferLength: 2,
  // },

  // =============================================================================
  // PRODUCTION LOGGING
  // =============================================================================
  
  // Enable source maps in production for debugging (P3 Lighthouse fix)
  productionBrowserSourceMaps: true,

  // =============================================================================
  // API CONFIGURATION
  // =============================================================================
  
  // API routes configuration handled in main rewrites function above
}

module.exports = nextConfig
