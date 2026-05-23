import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Photo',
  description: 'Upload your old photo for AI-powered restoration.',
  robots: { index: false, follow: false },
};

export default function UploadPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
