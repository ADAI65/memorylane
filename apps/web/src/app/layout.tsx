// @memorylane/web - Root Layout
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { inter, playfair } from '@/styles/fonts';
import { ToastContainer } from '@/components/ui/toast';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://memorylane-web.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'MemoryLane - AI Photo Restoration & Animation',
    template: '%s | MemoryLane',
  },
  description:
    'Restore, colorize, and animate your old photos with AI. Free basic restoration, premium AI-powered features. No watermarks, no signup required for basic use.',
  keywords: [
    'photo restoration',
    'AI photo enhancement',
    'vintage photo repair',
    'photo colorization',
    'photo animation',
    'old photo fix online',
    'AI photo restorer free',
    'restore old photos',
    'colorize black and white photos',
    'photo face enhancement',
    'vintage photo animation',
    'AI photo repair',
    'old family photo restoration',
    'free photo enhancer',
    'historical photo dating',
    'era-accurate colorization',
    'face matching old photos',
  ],
  authors: [{ name: 'MemoryLane', url: APP_URL }],
  creator: 'MemoryLane',
  publisher: 'MemoryLane',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'MemoryLane',
    title: 'MemoryLane - AI Photo Restoration & Animation',
    description:
      'Restore, colorize, and animate your old photos with cutting-edge AI technology. Free basic restoration, no watermarks.',
    images: [
      {
        url: `${APP_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'MemoryLane - AI Photo Restoration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MemoryLane - AI Photo Restoration & Animation',
    description:
      'Restore, colorize, and animate your old photos with AI. Free basic restoration.',
    images: [`${APP_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MemoryLane',
      url: APP_URL,
      description:
        'AI-powered photo restoration, colorization, and animation. Bring your precious vintage photos back to life.',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Basic photo restoration is free',
      },
    },
    {
      '@type': 'Organization',
      name: 'MemoryLane',
      url: APP_URL,
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is MemoryLane really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Basic photo restoration is completely free with no limits. Premium features like photo animation and memory videos are available once per day for free.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does AI photo restoration work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our AI models analyze your uploaded photo, detect damage patterns (scratches, fading, tears), and intelligently reconstruct missing or degraded areas while preserving the original character of the image.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is my data safe and private?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Your photos are encrypted at rest and in transit. AI processing is done on-demand and photos are not stored by our AI providers after processing. You can delete your photos at any time.',
          },
        },
        {
          '@type': 'Question',
          name: 'What photo formats are supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We support JPEG, PNG, WebP, and TIFF formats. Photos up to 10MB can be uploaded. For best results, use the highest resolution version available.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I animate my old photos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Our Photo Animation feature uses advanced AI to bring still portraits to life with natural facial movements. This is a premium feature available once per day for free.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
