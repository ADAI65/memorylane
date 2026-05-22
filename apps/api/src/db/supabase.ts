import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { env } from '../env.js';
import ws from 'ws';

const options: SupabaseClientOptions<'generic'> = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // @ts-ignore – Supabase types expect WebSocket, ws package provides it
    ws: ws,
  },
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
