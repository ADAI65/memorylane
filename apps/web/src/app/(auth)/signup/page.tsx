"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: authError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Check if email confirmation is required
      // If session is null but no error, user needs to confirm email
      if (!data.session) {
        setShowConfirmation(true);
      } else {
        // Auto-confirmed (e.g., dev mode or email confirmation disabled)
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Email confirmation screen
  if (showConfirmation) {
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
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-display font-bold text-primary-800 mb-2">
                Check your email
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                We&apos;ve sent a confirmation link to{' '}
                <span className="font-medium text-primary-800">{email}</span>.
                Please click the link to verify your account.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
                <Mail className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                <p>
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleSignup}
                    disabled={isLoading}
                    className="text-accent hover:text-accent-dark font-medium"
                  >
                    resend it
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
              Create your account
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Get started with unlimited free restorations
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                helperText="Must be at least 8 characters"
                required
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
          </div>

          <div className="px-8 py-4 bg-gray-50 rounded-b-2xl text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-accent hover:text-accent-dark font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
