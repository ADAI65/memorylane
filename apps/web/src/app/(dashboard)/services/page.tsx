// @memorylane/web - Services listing page
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image, Video, Clock, Users, FileText } from 'lucide-react';
import { SERVICE_PRICES } from '@memorylane/shared';

const services = [
  {
    name: 'Photo Animation',
    price: '$29',
    desc: 'Bring your vintage photos to life with subtle AI animation',
    icon: Sparkles,
    href: '/services/animation',
    popular: true,
  },
  {
    name: 'Memory Video',
    price: '$39',
    desc: 'Create a cinematic slideshow video with AI narration',
    icon: Video,
    href: '/services/memory-video',
    popular: false,
  },
  {
    name: 'Historical Dating',
    price: '$19',
    desc: 'AI analyzes your photo to determine its approximate era',
    icon: Clock,
    href: '/services/historical-dating',
    popular: false,
  },
  {
    name: 'Era-Accurate Colorization',
    price: '$19',
    desc: 'Colorize your photo with period-appropriate colors',
    icon: Image,
    href: '/services/era-colorization',
    popular: false,
  },
  {
    name: 'Face Match & Link',
    price: '$24',
    desc: 'Match and link faces across multiple photos in your collection',
    icon: Users,
    href: '/services/face-match',
    popular: false,
  },
  {
    name: 'Archival Certificate',
    price: '$15',
    desc: 'Get a professional archival certificate for your restored photo',
    icon: FileText,
    href: '/services/certificate',
    popular: false,
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800">Premium Services</h1>
        <p className="text-gray-500 mt-1">
          One-time AI-powered services. No subscription required.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Link key={service.name} href={service.href} className="block">
              <Card variant="interactive" padding="md" className="h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-accent/10">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  {service.popular && (
                    <Badge variant="gold" size="sm">Popular</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-primary-800 mb-1">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{service.desc}</p>
                <p className="text-xl font-bold text-accent">{service.price}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
