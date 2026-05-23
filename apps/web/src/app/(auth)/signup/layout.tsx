import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free MemoryLane account to save your restored photos and access premium AI features.',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
