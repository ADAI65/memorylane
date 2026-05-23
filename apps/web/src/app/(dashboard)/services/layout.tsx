import type { Metadata } from 'next';
import Script from 'next/script';

// Service pages are client-rendered but shell can be cached
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Premium AI Photo Services',
  description:
    'Explore premium AI photo services: animation, historical dating, era-accurate colorization, face matching, and more.',
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://memorylane-web.vercel.app';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: APP_URL },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${APP_URL}/services` },
  ],
};

export default function ServicesPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
