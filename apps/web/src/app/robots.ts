// @memorylane/web - robots.txt configuration
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://memorylane-web.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/restore/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
