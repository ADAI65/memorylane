// @memorylane/web - Store: Payment state management
import { create } from 'zustand';
import type { Payment, CheckoutResponse } from '@memorylane/shared';

interface PaymentState {
  payments: Payment[];
  isLoadingPayments: boolean;
  currentCheckout: CheckoutResponse | null;

  // Actions
  setPayments: (payments: Payment[]) => void;
  setLoadingPayments: (isLoading: boolean) => void;
  setCurrentCheckout: (checkout: CheckoutResponse | null) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  isLoadingPayments: false,
  currentCheckout: null,

  setPayments: (payments) => set({ payments }),
  setLoadingPayments: (isLoading) => set({ isLoadingPayments: isLoading }),
  setCurrentCheckout: (checkout) => set({ currentCheckout: checkout }),
}));
