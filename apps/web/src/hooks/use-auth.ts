// @memorylane/web - Hook: useAuth - authentication state
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectPlan, selectIsPro, selectIsAdmin } from '@/stores/auth-store';

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (store.isLoading && !store.user) {
      store.initialize();
    }
  }, [store]);

  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    plan: selectPlan(store),
    isPro: selectIsPro(store),
    isAdmin: selectIsAdmin(store),
    logout: store.logout,
    refreshProfile: store.refreshProfile,
  };
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  return { user, isLoading, isAuthenticated };
}
