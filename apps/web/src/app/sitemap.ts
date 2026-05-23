// @memorylane/web - sitemap.xml configuration
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://memorylane-web.vercel.app';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ];

  const servicePages = [
    { path: '/services/historical-dating', name: 'Historical Dating', priority: 0.7 },
    { path: '/services/era-colorization', name: 'Era-Accurate Colorization', priority: 0.7 },
    { path: '/services/face-match', name: 'Face Match & Link', priority: 0.7 },
    { path: '/services/animation', name: 'Photo Animation', priority: 0.7 },
    { path: '/services/memory-video', name: 'Memory Video', priority: 0.7 },
    { path: '/services/certificate', name: 'Archival Certificate', priority: 0.6 },
  ];

  const serviceSitemap: MetadataRoute.Sitemap = servicePages.map((s) => ({
    url: `${baseUrl}${s.path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: s.priority,
  }));

  return [...staticPages, ...serviceSitemap];
}
