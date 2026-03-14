import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lpcsryvamynithpvxffv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    // We use 'as any' here to bypass the temporary TypeScript limitation 
    // while still passing the root instruction to the Turbopack engine.
    turbopack: {
      root: ".",
    },
  } as any, 
};

export default nextConfig;