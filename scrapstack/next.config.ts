import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
 // Object literal may only specify known properties, and 'eslint' does not exist in type 'NextConfig'.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
