// @memorylane/web - Pricing Page (All Free)
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Check, Gift, Sparkles, ShieldCheck, Zap, Users } from 'lucide-react';

// Revalidate every 1 hour (pricing content changes rarely)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Pricing - Free AI Photo Restoration',
  description:
    'All AI photo restoration features are free. No credit card required. Restore, colorize, animate, and date your old photos with AI.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-24 pb-16 section-padding text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4">
          <Gift className="w-4 h-4" />
          100% Free
        </div>
        <h1 className="text-4xl font-display font-bold text-primary-800 mb-4">
          All Services Are Free
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Every AI-powered photo service, completely free. No credit card, no sign-up required.
        </p>
      </section>

      <section className="pb-20 section-padding">
        <div className="max-w-4xl mx-auto">
          <Card variant="elevated" padding="none" className="ring-2 ring-green-400 relative overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-1">
              <div className="bg-white rounded-t-[inherit] p-6 text-center">
                <h2 className="text-2xl font-display font-bold text-primary-800">Free Forever Plan</h2>
                <p className="text-gray-500 mt-1">Everything you need, nothing to pay</p>
                <div className="mt-4 mb-2">
                  <span className="text-5xl font-display font-bold text-green-600">$0</span>
                  <span className="text-gray-500 ml-2">forever</span>
                </div>
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Basic Restoration
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Unlimited restorations',
                      'Scratch & damage removal',
                      'Face enhancement',
                      '4K upscaling',
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Premium Services
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Photo Animation',
                      'Memory Video',
                      'Historical Dating',
                      'Era-Accurate Colorization',
                      'Face Match & Link',
                      'Archival Certificate',
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    Security & Privacy
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'End-to-end encryption',
                      'Photos auto-deleted after 30 days',
                      'No data selling',
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-primary-800 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Support
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Email support',
                      'Community forum',
                      'AI-powered help center',
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
