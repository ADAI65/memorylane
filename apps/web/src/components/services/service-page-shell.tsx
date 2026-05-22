// @memorylane/web - Premium Service Page Shell
// Reusable layout wrapper for all premium service pages
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, ShieldCheck, Star, Gift } from 'lucide-react';

interface ServicePageShellProps {
  title: string;
  description: string;
  price: number; // kept for API compat, but always 0 now
  icon: ReactNode;
  popular?: boolean;
  estimatedTime?: string;
  features: string[];
  /** 'high_cost' for photo_animation/memory_video (daily limit), 'unlimited' for others */
  limitType?: 'high_cost' | 'unlimited';
  children: ReactNode;
}

export function ServicePageShell({
  title,
  description,
  icon,
  estimatedTime,
  features,
  limitType = 'unlimited',
  children,
}: ServicePageShellProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-2xl bg-accent/10">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-primary-800">{title}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                <Gift className="w-3 h-3" />
                Free
              </span>
            </div>
            <p className="text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-3">
          {estimatedTime && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              ~{estimatedTime}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <ShieldCheck className="w-4 h-4" />
            100% Free — No sign-up required
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Star className="w-4 h-4" />
            AI-powered
          </div>
        </div>
      </div>

      {/* Content grid: form + sidebar */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <Card variant="elevated" padding="lg">
          <CardContent>
            {children}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Features */}
          <Card variant="outline" padding="md">
            <h3 className="font-semibold text-primary-800 mb-3">What you get</h3>
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </Card>

          {/* Free CTA */}
          <Card variant="glass" padding="md" className="!bg-accent/5 !border-accent/10">
            <p className="text-sm font-medium text-primary-800 mb-1">
              {limitType === 'high_cost' ? '1 Free Use Per Day' : '100% Free — No Limits'}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {limitType === 'high_cost'
                ? 'This premium AI service is free with a daily limit of 1 use. Resets at midnight UTC.'
                : 'All premium AI services are free to use. No credit card, no sign-up required.'}
            </p>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="w-full">
                View My Projects
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
