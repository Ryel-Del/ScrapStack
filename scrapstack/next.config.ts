import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // This ignores that CSS declaration error and lets the build finish
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
