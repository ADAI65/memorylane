/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable gzip compression (Vercel does this by default, but good for other hosts)
  compress: true,

  // Remove X-Powered-By header for security & smaller response
  poweredByHeader: false,

  // Cache ISR pages for 60 seconds at CDN edge
  swrMinTTL: 60,

  // Optimize images
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
    // Use smaller image sizes for faster loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Allow the API to be reached from the frontend
  async rewrites() {
    return [];
  },
};

module.exports = nextConfig;
