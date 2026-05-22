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
        const { data } = await authApi.getProfile();
        if (data) {
          set({ user: data, isAuthenticated: true });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  refreshProfile: async () => {
    try {
      const { data } = await authApi.getProfile();
      if (data) {
        set({ user: data, isAuthenticated: true });
      }
    } catch {
      // silently fail
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
