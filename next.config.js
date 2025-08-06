/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fixes npm packages that depend on `_http_common` module
      config.externals.push('_http_common');
      
      // Ensure Prisma client is included in the serverless build
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          dns: false,
          child_process: false,
        };
      }
    }
    
    return config;
  },
  
  // Enable server actions
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  
  // Disable type checking during build (handled by CI/CD)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build (handled by CI/CD)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable static optimization for API routes
  output: 'standalone',
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure images if needed
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
