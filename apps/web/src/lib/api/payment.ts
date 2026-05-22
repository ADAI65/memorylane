// @memorylane/web - API Client: Payment endpoints
import { apiClient } from './client';
import type {
  CreateCheckoutRequest,
  CheckoutResponse,
  Payment,
  ApiResponse,
} from '@memorylane/shared';

export const paymentApi = {
  async createCheckout(data: CreateCheckoutRequest): Promise<ApiResponse<CheckoutResponse>> {
    return apiClient.post<CheckoutResponse>('/api/payments/checkout', data);
  },

  async getHistory(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<Payment[]>> {
    const searchParams: Record<string, string> = {};
    if (params?.page) searchParams.page = String(params.page);
    if (params?.per_page) searchParams.per_page = String(params.per_page);
    return apiClient.get<Payment[]>('/api/payments/history', searchParams);
  },

  async get(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`/api/payments/${id}`);
  },

  async getSubscription(): Promise<ApiResponse<{
    subscription: {
      plan: string;
      status: string;
      current_period_end: string;
      cancel_at_period_end: boolean;
    } | null;
  }>> {
    return apiClient.get('/api/payments/subscription');
  },
};
