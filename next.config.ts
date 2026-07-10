import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Nothing exotic needed yet. Keep the image optimizer locked down if we add
  // remote images later.
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
