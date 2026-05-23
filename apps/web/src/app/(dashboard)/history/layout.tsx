import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History',
  description: 'View your photo restoration history.',
  robots: { index: false, follow: false },
};

export default function HistoryPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
