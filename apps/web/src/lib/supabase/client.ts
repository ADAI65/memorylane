// @memorylane/web - Lib: Supabase Browser Client
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Guard against SSR — createBrowserClient requires browser APIs
  if (typeof window === 'undefined') {
    throw new Error('createClient() must only be called in the browser');
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
