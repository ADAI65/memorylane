import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Era-Accurate Photo Colorization',
  description:
    'Colorize your black and white photos with AI that respects the historical era. Get period-accurate colors for vintage photographs.',
  openGraph: {
    title: 'Era-Accurate Colorization - MemoryLane',
    description: 'Period-accurate AI colorization for vintage photos.',
  },
};

export default function EraColorizationPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
