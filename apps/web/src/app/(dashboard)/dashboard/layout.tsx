import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your MemoryLane dashboard - view restoration history and manage your photos.',
  robots: { index: false, follow: false },
};

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
