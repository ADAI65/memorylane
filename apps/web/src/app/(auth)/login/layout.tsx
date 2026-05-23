import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your MemoryLane account to access your photo restoration history and premium features.',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
