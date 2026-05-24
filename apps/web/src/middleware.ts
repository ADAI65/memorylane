// @memorylane/web - Next.js Middleware
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Public routes that don't need Supabase auth — skip the round-trip to speed them up
const PUBLIC_PATHS = new Set([
  '/',
  '/pricing',
  '/privacy',
  '/terms',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
]);

// Public path prefixes (e.g. /blog/*, /#anchors)
const PUBLIC_PREFIXES = ['/login', '/signup', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast-path: skip Supabase auth check for fully public pages
  // This eliminates a network round-trip (~200-400ms) for every public page load
  if (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next({ request });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
