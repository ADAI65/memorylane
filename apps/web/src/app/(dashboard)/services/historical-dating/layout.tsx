import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historical Photo Dating',
  description:
    'Use AI to estimate the era and date of your old photographs based on clothing, technology, and photographic style.',
  openGraph: {
    title: 'Historical Photo Dating - MemoryLane',
    description: 'AI-powered photo era estimation and dating.',
  },
};

export default function HistoricalDatingPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
