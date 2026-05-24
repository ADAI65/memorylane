import { ServiceType } from '../types/enums.js';
// Service pricing in cents (USD)
export const SERVICE_PRICES = {
    [ServiceType.BASIC_RESTORATION]: {
        priceCents: 0,
        displayName: 'Basic Photo Restoration',
        description: 'AI-powered scratch removal, face enhancement, and 4K upscaling',
    },
    [ServiceType.PHOTO_ANIMATION]: {
        priceCents: 2900,
        displayName: 'Photo Animation',
        description: 'Bring your vintage photos to life with subtle AI animation',
    },
    [ServiceType.MEMORY_VIDEO]: {
        priceCents: 3900,
        displayName: 'Memory Video',
        description: 'Create a cinematic slideshow video with AI narration',
    },
    [ServiceType.HISTORICAL_DATING]: {
        priceCents: 1900,
        displayName: 'Historical Dating',
        description: 'AI analyzes your photo to determine its approximate era and decade',
    },
    [ServiceType.ERA_COLORIZATION]: {
        priceCents: 1900,
        displayName: 'Era-Accurate Colorization',
        description: 'Colorize your photo with period-appropriate colors based on the era',
    },
    [ServiceType.FACE_MATCH]: {
        priceCents: 2400,
        displayName: 'Face Match & Link',
        description: 'Match and link faces across multiple photos in your collection',
    },
    [ServiceType.CERTIFICATE]: {
        priceCents: 1500,
        displayName: 'Archival Certificate',
        description: 'Get a professional archival certificate for your restored photo',
    },
};
// Subscription plans
export const SUBSCRIPTION_PLANS = {
    pro: {
        name: 'Professional',
        priceMonthly: 14,
        priceYearly: 149,
        yearlySavings: 19,
        features: [
            'Unlimited restorations',
            '4K upscaling',
            'All basic features',
            'Priority processing',
            'Email support',
        ],
    },
    unlimited: {
        name: 'Unlimited',
        priceMonthly: 99,
        priceYearly: 0, // Only annual
        yearlySavings: 0,
        features: [
            'Everything in Professional',
            '8K upscaling',
            'Batch processing',
            'All premium features (20% off)',
            'Priority support',
            'Early access to new features',
        ],
    },
};
// Estimated processing durations in seconds
export const ESTIMATED_DURATIONS = {
    [ServiceType.BASIC_RESTORATION]: 30,
    [ServiceType.PHOTO_ANIMATION]: 120,
    [ServiceType.MEMORY_VIDEO]: 300,
    [ServiceType.HISTORICAL_DATING]: 15,
    [ServiceType.ERA_COLORIZATION]: 45,
    [ServiceType.FACE_MATCH]: 60,
    [ServiceType.CERTIFICATE]: 10,
};
//# sourceMappingURL=pricing.js.map