// @memorylane/web - Store: Auth state management
import { create } from 'zustand';
import type { Profile, UserPlan } from '@memorylane/shared';
import { createClient } from '@/lib/supabase/client';
import { authApi } from '@/lib/api/auth';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  setUser: (user: Profile | null) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Try to get full profile from backend
        try {
          const { data } = await authApi.getProfile();
          if (data) {
            set({ user: data, isAuthenticated: true });
            return;
          }
        } catch {
          // Backend unavailable or no profile yet — fall through to fallback
        }

        // Fallback: use Supabase session data directly so isAuthenticated is still true
        const now = new Date().toISOString();
        const fallbackProfile: Profile = {
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: authUser.user_metadata?.full_name ?? null,
          avatar_url: authUser.user_metadata?.avatar_url ?? null,
          plan: 'free' as UserPlan,
          subscription_status: 'inactive',
          stripe_customer_id: null,
          is_admin: false,
          daily_free_used: 0,
          daily_free_reset_at: now,
          premium_usage_today: 0,
          premium_usage_reset_at: now,
          created_at: authUser.created_at,
          updated_at: now,
        };
        set({ user: fallbackProfile, isAuthenticated: true });
      } else {
        // No valid auth user — NOT authenticated even if we have a stale local profile
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  logout: async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    try {
      await authApi.logout();
    } catch {
      // ignore if backend is unavailable
    }
    set({ user: null, isAuthenticated: false });
  },

  refreshProfile: async () => {
    try {
      const { data } = await authApi.getProfile();
      if (data) {
        set({ user: data, isAuthenticated: true });
      }
    } catch {
      // silently fail — keep existing auth state
    }
  },
}));

// Selectors
export const selectPlan = (state: AuthState): UserPlan =>
  (state.user?.plan ?? 'free') as UserPlan;

export const selectIsPro = (state: AuthState): boolean =>
  state.user?.plan === 'pro' || state.user?.plan === 'unlimited';

export const selectIsUnlimited = (state: AuthState): boolean =>
  state.user?.plan === 'unlimited';

export const selectIsAdmin = (state: AuthState): boolean =>
  !!state.user?.is_admin;
