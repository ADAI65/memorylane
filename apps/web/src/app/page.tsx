// @memorylane/web - Landing Page
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Shield, CheckCircle, Clock, Sparkles,
  Video, History, Palette, Users, FileCheck,
  Upload, Cpu, Download,
} from 'lucide-react';
import Image from 'next/image';

const premiumServices = [
  {
    title: 'Photo Animation',
    tagline: '"Bring ancestors to life"',
    desc: 'Proprietary AI generates subtle facial movements — smiles, blinks, head tilts — creating emotional video moments.',
    features: ['Natural facial expressions', 'Audio sync capability', '1080p HD output'],
    href: '/services/animation',
    icon: Sparkles,
    gradient: 'from-accent to-accent-light',
    featured: true,
    highCost: true,
  },
  {
    title: 'Memory Video',
    tagline: '"Your photos tell a story"',
    desc: 'AI auto-generates cinematic slideshow videos with period-accurate music, transitions, and AI narration.',
    features: ['AI narration generation', 'Era-matched music', 'Shareable MP4 export'],
    href: '/services/memory-video',
    icon: Video,
    gradient: 'from-indigo-500 to-purple-500',
    featured: false,
    highCost: true,
  },
  {
    title: 'Historical Dating',
    tagline: '"Know when it was taken"',
    desc: 'AI analyzes clothing styles, hair fashion, and architectural elements to pinpoint when your photo was captured.',
    features: ['Clothing & hair analysis', 'Architectural context', 'Confidence score'],
    href: '/services/historical-dating',
    icon: History,
    gradient: 'from-violet-500 to-purple-600',
    featured: false,
  },
  {
    title: 'Era Colorization',
    tagline: '"Colors of the time"',
    desc: 'Colorize with period-appropriate colors based on historical accuracy — not just generic colorization.',
    features: ['Era-specific palettes', 'Auto-detect decade', 'Manual override'],
    href: '/services/era-colorization',
    icon: Palette,
    gradient: 'from-amber-500 to-red-500',
    featured: false,
  },
  {
    title: 'Face Match & Link',
    tagline: '"Find family across photos"',
    desc: 'Match and link the same person across multiple photos using advanced facial recognition technology.',
    features: ['Batch upload (2–20 photos)', 'Confidence scoring', 'Auto-grouping'],
    href: '/services/face-match',
    icon: Users,
    gradient: 'from-sky-500 to-blue-600',
    featured: false,
  },
  {
    title: 'Archival Certificate',
    tagline: '"Professional documentation"',
    desc: 'Receive a beautifully designed archival certificate documenting your photo restoration and historical analysis.',
    features: ['PDF download', 'Print-ready quality', 'Historical context'],
    href: '/services/certificate',
    icon: FileCheck,
    gradient: 'from-emerald-500 to-green-400',
    featured: false,
  },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    title: 'Genealogy Researcher',
    initials: 'SM',
    quote: 'MemoryLane brought my great-grandmother\'s photo to life. The animation made my grandmother cry tears of joy. An absolutely incredible free tool.',
  },
  {
    name: 'David Chen',
    title: 'Family Historian',
    initials: 'DC',
    quote: 'The historical dating feature confirmed our family photos were from the 1920s. The era-accurate colorization is stunning.',
  },
  {
    name: 'Emily Rodriguez',
    title: 'Documentary Filmmaker',
    initials: 'ER',
    quote: 'I\'ve used MemoryLane for three documentary projects. The archival certificates add incredible professionalism to our work.',
  },
];

const stats = [
  { value: '2M+', label: 'Photos Restored' },
  { value: '150K+', label: 'Happy Customers' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '10s', label: 'Avg. Processing' },
];

// Force static generation — no dynamic data on homepage
export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="bg-gradient-hero min-h-screen flex items-center pt-16 relative overflow-hidden">
          {/* Decorative radial glow */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] right-[-15%] w-[60%] h-[120%] bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[80%] bg-gold/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/15 border border-accent/30 rounded-full text-sm text-accent-light font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered · Over 2 Million Photos Restored
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
                  Bring Your{' '}
                  <span className="text-gradient-gold">Precious Memories</span>{' '}
                  Back to Life
                </h1>

                <p className="text-lg text-white/75 mb-10 max-w-xl leading-relaxed font-light">
                  Restore, animate, and relive your family history. AI-powered photo restoration
                  plus exclusive features no other service provides.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link href="/signup">
                    <Button size="lg" className="btn-gold">
                      <Upload className="w-5 h-5 mr-2" />
                      Restore Free Now
                    </Button>
                  </Link>
                  <Link href="/#services">
                    <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                      See Services
                    </Button>
                  </Link>
                </div>

                {/* Trust */}
                <div className="flex flex-wrap gap-6 pt-6 border-t border-white/10">
                  {[
                    { icon: Shield, label: 'Bank-Level Security' },
                    { icon: CheckCircle, label: '100% Satisfaction' },
                    { icon: Clock, label: 'Ready in 10 Seconds' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-white/60 text-sm">
                      <Icon className="w-4 h-4 text-gold" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Before/After */}
              <div className="hidden lg:block">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/40 transform perspective-1000 rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-500">
                  <div className="grid grid-cols-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80&sat=-100&con=-30"
                        alt="Before restoration"
                        fill
                        sizes="(max-width: 1024px) 50vw, 400px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-accent/90 text-white text-xs font-semibold uppercase tracking-wider rounded-md">
                        Before
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80"
                        alt="After restoration"
                        fill
                        sizes="(max-width: 1024px) 50vw, 400px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-gold/90 text-primary-900 text-xs font-semibold uppercase tracking-wider rounded-md">
                        After
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="hidden xl:block">
                  <div className="absolute top-0 right-0 -translate-y-4 translate-x-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow">
                    <div className="text-2xl font-extrabold text-primary-800">2M+</div>
                    <div className="text-xs text-gray-400">Photos Restored</div>
                  </div>
                  <div className="absolute bottom-8 -left-8 bg-white rounded-2xl p-4 shadow-xl animate-bounce-slow" style={{ animationDelay: '1s' }}>
                    <div className="text-2xl font-extrabold text-primary-800">4.9★</div>
                    <div className="text-xs text-gray-400">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────── */}
        <section className="bg-white py-12 border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map(({ value, label }) => (
              <div key={label} className="py-4">
                <div className="text-4xl font-extrabold text-gradient-accent">{value}</div>
                <div className="text-sm text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Below-fold: lazy loaded ────────────────── */}
        <Suspense fallback={null}>
          {/* ── Premium Services ─────────────────────────── */}
        <section id="services" className="section-y bg-surface-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-5 py-2 bg-gold/10 text-gold text-sm font-semibold uppercase tracking-widest rounded-full border border-gold/30 mb-4">
                Premium Services
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-800 mb-4">
                Beyond Ordinary Restoration
              </h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Exclusive capabilities that transform photos into living legacies
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumServices.map((svc) => {
                const Icon = svc.icon;
                return (
                  <Link key={svc.title} href={svc.href}>
                    <div className={`group h-full bg-white rounded-3xl p-7 border-2 transition-all duration-300 hover:-translate-y-3 ${
                      svc.featured
                        ? 'bg-gradient-to-br from-primary-900 to-primary-800 border-gold text-white shadow-lg'
                        : 'border-gold/15 hover:border-gold hover:shadow-xl hover:shadow-gold/10'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${svc.gradient} text-white`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        {svc.featured && (
                          <span className="px-3 py-1 bg-gradient-to-r from-accent to-accent-light text-white text-[0.7rem] font-bold uppercase tracking-wider rounded-full">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-display font-semibold mb-1 ${svc.featured ? 'text-white' : 'text-primary-800'}`}>
                        {svc.title}
                      </h3>
                      <p className={`text-sm italic mb-3 ${svc.featured ? 'text-gold' : 'text-gold'}`}>
                        {svc.tagline}
                      </p>
                      <p className={`text-sm leading-relaxed mb-4 flex-grow ${svc.featured ? 'text-white/75' : 'text-gray-500'}`}>
                        {svc.desc}
                      </p>
                      <ul className={`space-y-2 mb-5 text-sm ${svc.featured ? 'text-white/80' : 'text-gray-500'}`}>
                        {svc.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-2 mb-5">
                        {svc.highCost ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                            1 Free / Day
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                            Free — Unlimited
                          </span>
                        )}
                      </div>
                      <button className={`w-full py-3 rounded-xl font-semibold transition-all text-sm ${
                        svc.featured
                          ? 'bg-gradient-to-r from-gold to-gold-light text-primary-900 hover:shadow-lg hover:shadow-gold/30'
                          : 'border-2 border-gold text-gold hover:bg-gold hover:text-primary-900'
                      }`}>
                        Try Now — Free
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>

            <p className="text-center text-gray-500 mt-10">
              <strong className="text-gold">All services are free</strong> — basic restorations unlimited, premium video services 1 free per day
            </p>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────── */}
        <section id="how-it-works" className="section-y bg-gradient-primary relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-5 py-2 bg-white/10 text-gold text-sm font-semibold uppercase tracking-widest rounded-full mb-4">
                Simple Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-white/60 text-lg">Three steps to bring your memories back</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-gold via-accent to-gold" />

              {[
                { icon: Upload, step: '01', title: 'Upload', desc: 'Upload your vintage photo in any common format — JPEG, PNG, TIFF, or WEBP.' },
                { icon: Cpu, step: '02', title: 'AI Processing', desc: 'Our AI models analyze, restore, enhance, and transform your image in seconds.' },
                { icon: Download, step: '03', title: 'Download', desc: 'Get your high-quality restored photo or premium result in minutes.' },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div key={step} className="text-center relative z-10">
                  <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-gold flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-display font-bold text-gold">{step}</span>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-white mb-2">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────── */}
        <section className="section-y bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-5 py-2 bg-accent/8 text-accent text-sm font-semibold uppercase tracking-widest rounded-full mb-4">
                Testimonials
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary-800 mb-4">
                Loved by Thousands
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-surface-muted rounded-3xl p-7 hover:-translate-y-2 hover:shadow-xl transition-all">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-gold fill-gold" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-500 leading-relaxed mb-6 text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white font-bold text-sm">
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary-800">{t.name}</h4>
                      <p className="text-xs text-gray-400">{t.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="bg-gradient-primary py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Ready to Restore Your Memories?
            </h2>
            <p className="text-white/75 text-lg mb-10">
              Start restoring your photos for free. No credit card required.
            </p>
            <Link href="/signup">
              <Button size="lg" className="btn-gold text-lg px-10 py-4">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
