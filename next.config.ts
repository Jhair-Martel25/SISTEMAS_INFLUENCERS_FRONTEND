import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.56.1', 'localhost:5173'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;