import { ServiceType } from '../types/enums.js';
export declare const SERVICE_PRICES: Record<ServiceType, {
    priceCents: number;
    displayName: string;
    description: string;
}>;
export declare const SUBSCRIPTION_PLANS: {
    readonly pro: {
        readonly name: "Professional";
        readonly priceMonthly: 14;
        readonly priceYearly: 149;
        readonly yearlySavings: 19;
        readonly features: readonly ["Unlimited restorations", "4K upscaling", "All basic features", "Priority processing", "Email support"];
    };
    readonly unlimited: {
        readonly name: "Unlimited";
        readonly priceMonthly: 99;
        readonly priceYearly: 0;
        readonly yearlySavings: 0;
        readonly features: readonly ["Everything in Professional", "8K upscaling", "Batch processing", "All premium features (20% off)", "Priority support", "Early access to new features"];
    };
};
export declare const ESTIMATED_DURATIONS: Record<ServiceType, number>;
//# sourceMappingURL=pricing.d.ts.map