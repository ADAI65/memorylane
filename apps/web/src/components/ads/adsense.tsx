// @memorylane/web - Google AdSense Ad Component
'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

/**
 * Google AdSense ad unit component.
 * Uses placeholder publisher ID — replace with real one after AdSense approval.
 *
 * Usage: <AdSense slot="1234567890" format="auto" />
 */
export function AdSense({ slot, format = 'auto', style, className = '', responsive = true }: AdBannerProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded (e.g. ad blocker) — silent fail
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : undefined}
      />
    </div>
  );
}

/**
 * Horizontal banner ad — ideal for page headers/footers
 */
export function AdBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`ad-banner-wrapper ${className}`}>
      <AdSense
        slot="banner-top"
        format="horizontal"
        style={{ width: '100%', maxWidth: '728px', height: '90px', margin: '0 auto' }}
        className="w-full"
      />
    </div>
  );
}

/**
 * Sidebar / inline rectangle ad
 */
export function AdSidebar({ className = '' }: { className?: string }) {
  return (
    <div className={`ad-sidebar-wrapper ${className}`}>
      <AdSense
        slot="sidebar-rect"
        format="rectangle"
        style={{ width: '300px', height: '250px' }}
      />
    </div>
  );
}

/**
 * In-content ad — fits between sections
 */
export function AdInContent({ className = '' }: { className?: string }) {
  return (
    <div className={`ad-incontent-wrapper py-4 ${className}`}>
      <AdSense
        slot="incontent-auto"
        format="auto"
        style={{ width: '100%', display: 'block' }}
      />
    </div>
  );
}
