import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Face Match & Link',
  description:
    'Find matching faces across your photo collection. AI-powered face recognition to link family members across different photographs.',
  openGraph: {
    title: 'Face Match & Link - MemoryLane',
    description: 'AI face recognition to link family members across photos.',
  },
};

export default function FaceMatchPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
