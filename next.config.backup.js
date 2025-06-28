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
  
  // Security headers
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
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://api.vercel.com https://*.neon.tech https://vitals.vercel-insights.com",
              "frame-src 'none'",
            ].join('; ')
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

  // Experimental features for better performance
  experimental: {
    // Enable modern bundling
    esmExternals: true,

    // Optimize server components
    serverComponentsExternalPackages: ['@prisma/client'],

    // Disable turbo mode temporarily to fix compilation issues
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
  // WEBPACK CONFIGURATION
  // =============================================================================
  
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // =============================================================================
    // WEBPACK RUNTIME ERROR FIXES - PROVEN SOLUTIONS
    // =============================================================================

    // Fix "self is not defined" errors in vendor bundles
    config.plugins.push(
      new webpack.DefinePlugin({
        'typeof self': JSON.stringify('undefined'),
        'typeof window': isServer ? JSON.stringify('undefined') : JSON.stringify('object'),
        'typeof global': JSON.stringify('object'),
        'typeof globalThis': JSON.stringify('object'),
      })
    );

    // Ignore problematic modules that cause SSR issues
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(canvas|jsdom)$/,
      })
    );

    // Provide polyfills for Node.js globals in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Production optimizations
    if (!dev) {
      // Enhanced bundle splitting with runtime isolation
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: -5,
            reuseExistingChunk: true,
          },
        },
      };

      // Runtime chunk optimization
      config.optimization.runtimeChunk = {
        name: 'runtime',
      };

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

    // Handle Prisma client and other server-only modules
    if (isServer) {
      config.externals.push('@prisma/client');

      // Additional server-only externals
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }

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
      // HTTPS enforcement in production
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          has: [
            {
              type: 'header',
              key: 'x-forwarded-proto',
              value: 'http',
            },
          ],
          destination: 'https://rk-institute.vercel.app/:path*',
          permanent: true,
        },
      ] : []),
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

  // =============================================================================
  // INTERNATIONALIZATION (if needed)
  // =============================================================================
  
  // i18n: {
  //   locales: ['en', 'es', 'fr'],
  //   defaultLocale: 'en',
  // },

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
  
  // Disable source maps in production for security
  productionBrowserSourceMaps: false,

  // =============================================================================
  // API CONFIGURATION
  // =============================================================================
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
