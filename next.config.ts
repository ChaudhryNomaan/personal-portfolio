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
  // We only apply experimental settings if we are in development mode
  // This prevents the "Unrecognized key" warning during Vercel builds
  experimental: process.env.NODE_ENV === 'development' ? {
    turbopack: {
      root: ".",
    },
  } as any : {},
};

export default nextConfig;