// ── WebSocket polyfill for Node.js < 22 ──
// ESM modules evaluate imports in declaration order. By using createRequire
// (from built-in node:module) before importing @supabase/supabase-js,
// the polyfill is guaranteed to run before Supabase checks globalThis.WebSocket.
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
if (typeof globalThis.WebSocket === 'undefined') {
  const wsMod = _require('ws');
  Object.defineProperty(globalThis, 'WebSocket', {
    value: wsMod.WebSocket || wsMod,
    writable: true,
    configurable: true,
  });
}

import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { env } from '../env.js';

const options: SupabaseClientOptions<'generic'> = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  // Disable realtime to avoid WebSocket dependency
  // @ts-expect-error - channels is not in the type definition but works at runtime
  realtime: { channels: 'none' },
};

/**
 * Supabase admin client (bypasses RLS, uses service role key)
 * Only use this on the backend for server-side operations
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  options,
);

/**
 * Types for Supabase database
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: 'free' | 'pro' | 'unlimited';
          subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled';
          stripe_customer_id: string | null;
          daily_free_used: number;
          daily_free_reset_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'unlimited';
          subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled';
          stripe_customer_id?: string | null;
          daily_free_used?: number;
          daily_free_reset_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: 'free' | 'pro' | 'unlimited';
          subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled';
          stripe_customer_id?: string | null;
          daily_free_used?: number;
          daily_free_reset_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
