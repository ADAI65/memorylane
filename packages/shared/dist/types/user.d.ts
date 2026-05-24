export interface User {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
}
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    plan: 'free' | 'pro' | 'unlimited';
    subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled';
    stripe_customer_id: string | null;
    is_admin: boolean;
    daily_free_used: number;
    daily_free_reset_at: string;
    premium_usage_today: number;
    premium_usage_reset_at: string;
    created_at: string;
    updated_at: string;
}
export interface AuthResponse {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    error: string | null;
}
export interface Session {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
}
//# sourceMappingURL=user.d.ts.map