// @memorylane/web - API Client: Base fetch wrapper
import type { ApiResponse } from '@memorylane/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_TIMEOUT_MS = 8000; // 8 second timeout for all API calls

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Attach Supabase JWT for backend auth (browser only)
    if (typeof window !== 'undefined') {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        // First try getSession() for the access_token
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          return headers;
        }

        // Safari ITP / private browsing may block cookies → getSession() returns null
        // Fall back: try getUser() to validate/reveal the session, then getSession()
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: { session: session2 } } = await supabase.auth.getSession();
          if (session2?.access_token) {
            headers['Authorization'] = `Bearer ${session2.access_token}`;
            return headers;
          }

          // Final fallback: read directly from localStorage (Supabase SSR fallback storage)
          const storageKey = `${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1]}.accessToken`;
          const storedToken = localStorage.getItem(storageKey);
          if (storedToken) {
            headers['Authorization'] = `Bearer ${storedToken}`;
            return headers;
          }

          console.warn('[ApiClient] User authenticated but access token unavailable (Safari ITP?)');
        } else {
          console.warn('[ApiClient] getUser() returned null — user not authenticated');
        }
      } catch (err) {
        console.error('[ApiClient] Auth check failed:', err);
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const authHeaders = await this.getHeaders();
    const headers = {
      ...authHeaders,
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Send cookies for auth
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: data.message || 'An unexpected error occurred',
          },
        };
      }

      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return {
          success: false,
          error: { code: 'TIMEOUT', message: 'Request timed out. Please try again.' },
        };
      }
      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Network error. Please check your connection.' },
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const searchParams = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${searchParams}`);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
