// @memorylane/web - API Client: Auth endpoints
import { apiClient } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  ApiResponse,
  Profile,
} from '@memorylane/shared';

export const authApi = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthTokens>> {
    return apiClient.post<AuthTokens>('/api/auth/login', data);
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthTokens>> {
    return apiClient.post<AuthTokens>('/api/auth/register', data);
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/logout');
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/forgot-password', { email });
  },

  async resetPassword(password: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/reset-password', { password });
  },

  async getProfile(): Promise<ApiResponse<Profile>> {
    return apiClient.get<Profile>('/api/users/me');
  },

  async updateProfile(data: {
    full_name?: string;
    avatar_url?: string;
  }): Promise<ApiResponse<Profile>> {
    return apiClient.patch<Profile>('/api/users/me', data);
  },
};
