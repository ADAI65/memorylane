// @memorylane/web - Root Layout
import type { Metadata } from 'next';
import Script from 'next/script';
import { inter, playfair } from '@/styles/fonts';
import { ToastContainer } from '@/components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'MemoryLane - AI Photo Restoration & Animation',
    template: '%s | MemoryLane',
  },
  description:
    'AI-powered photo restoration, colorization, and animation. Bring your precious vintage photos back to life with cutting-edge technology.',
  keywords: [
    'photo restoration',
    'AI photo enhancement',
    'vintage photo repair',
    'photo colorization',
    'photo animation',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans">
        <ToastContainer />
        {/* Google AdSense — replace ca-pub-XXXXXXXXXXXXXXXX with your real publisher ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {children}
      </body>
    </html>
  );
}
