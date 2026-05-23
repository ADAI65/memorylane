import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Archival Certificate',
  description:
    'Generate a beautiful archival-quality certificate for your restored photographs. Perfect for framing and family archives.',
  openGraph: {
    title: 'Archival Certificate - MemoryLane',
    description: 'Archival certificates for restored photographs.',
  },
};

export default function CertificatePageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
