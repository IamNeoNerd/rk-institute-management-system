/** @type {import('next').NextConfig} */

// Minimal Next.js configuration for debugging compilation issues
const nextConfig = {
  // Basic configuration only
  reactStrictMode: true,
  swcMinify: true,
  
  // Minimal experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Basic webpack configuration
  webpack: (config, { isServer }) => {
    // Handle Prisma client
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    
    return config;
  },
  
  // Disable problematic features
  poweredByHeader: false,
  trailingSlash: false,
  
  // Basic TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Basic ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
