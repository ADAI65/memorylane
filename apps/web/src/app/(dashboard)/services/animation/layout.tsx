import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Photo Animation',
  description:
    'Bring your old photos to life with AI-powered animation. Add subtle motion, natural movement, and speech to your vintage photographs.',
  openGraph: {
    title: 'AI Photo Animation - MemoryLane',
    description: 'Bring your old photos to life with AI animation.',
  },
};

export default function AnimationPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
