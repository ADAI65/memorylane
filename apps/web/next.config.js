/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Allow the API to be reached from the frontend
  async rewrites() {
    return [
      // In production, set NEXT_PUBLIC_API_URL to the API domain
      // In development, proxy /api to the backend for cookie auth
    ];
  },
};

module.exports = nextConfig;
