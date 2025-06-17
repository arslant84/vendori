import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      // Ensure config.resolve and config.resolve.fallback exist
      config.resolve = config.resolve || {};
      config.resolve.fallback = config.resolve.fallback || {};
      
      // Set fallbacks for fs and path
      config.resolve.fallback.fs = false;
      config.resolve.fallback.path = false;
    }

    return config;
  },
  // Add proper static file handling
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
