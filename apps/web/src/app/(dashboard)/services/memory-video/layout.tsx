import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Memory Video',
  description:
    'Create emotional video montages from your restored photos with AI-powered transitions, music, and narration.',
  openGraph: {
    title: 'Memory Video - MemoryLane',
    description: 'Create emotional video montages from your restored photos.',
  },
};

export default function MemoryVideoPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
