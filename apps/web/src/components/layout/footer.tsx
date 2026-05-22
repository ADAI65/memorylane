// @memorylane/web - Component: Public Footer
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { href: '/#services', label: 'Services' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/#how-it-works', label: 'How It Works' },
    ],
    Company: [
      { href: '#', label: 'About' },
      { href: '#', label: 'Blog' },
      { href: '#', label: 'Contact' },
    ],
    Legal: [
      { href: '#', label: 'Privacy Policy' },
      { href: '#', label: 'Terms of Service' },
      { href: '#', label: 'Cookie Policy' },
    ],
  };

  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
              <span className="text-xl font-display font-bold">MemoryLane</span>
            </Link>
            <p className="text-primary-300 text-sm leading-relaxed">
              AI-powered photo restoration and animation. Bring your precious
              memories back to life.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-200 mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-primary-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-400">
            &copy; {currentYear} MemoryLane. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social icons placeholder */}
            <span className="text-primary-400 text-sm">
              Made with love for preserving memories
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
