import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure images if you're using Next.js Image component
  images: {
    domains: ['dl.airtable.com'], // Add your image domains here
  },
  
  // Environment variables that should be available on the client side
  // Make sure to add these to your Vercel project settings
  env: {
    NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
  },
  
  // Enable server actions with proper typing
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Output source maps in development only
  productionBrowserSourceMaps: false,
  
  // Enable webpack 5
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
