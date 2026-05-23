"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setEmailSent(true);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-accent" />
              <span className="text-2xl font-display font-bold text-white">
                MemoryLane
              </span>
            </Link>
          </div>

          <Card className="p-8" padding="none">
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-2xl font-display font-bold text-primary-800 mb-2">
                Check your email
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-medium text-primary-800">{email}</span>.
                The link will expire in 1 hour.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
                <p>
                  Didn&apos;t receive the email? Check your spam folder, or{' '}
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-accent hover:text-accent-dark font-medium"
                  >
                    try a different email
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="px-8 py-4 bg-gray-50 rounded-b-2xl text-center">
              <Link
                href="/login"
                className="text-sm text-gray-500 hover:text-primary-800 font-medium"
              >
                Back to Sign in
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-accent" />
            <span className="text-2xl font-display font-bold text-white">
              MemoryLane
            </span>
          </Link>
        </div>

        <Card className="p-8" padding="none">
          <div className="p-8">
            <h1 className="text-2xl font-display font-bold text-primary-800 mb-2">
              Reset your password
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          </div>

          <div className="px-8 py-4 bg-gray-50 rounded-b-2xl text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-800 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
