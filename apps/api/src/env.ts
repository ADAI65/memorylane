import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Stripe (暂时可选，未接入支付)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_UNLIMITED_YEARLY_PRICE_ID: z.string().optional(),

  // AI Providers
  REPLICATE_API_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  HEYGEN_API_KEY: z.string().optional(),
  RUNWAY_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  INSIGHTFACE_API_URL: z.string().url().optional(),
  INSIGHTFACE_API_KEY: z.string().optional(),
  ALL_PROXY: z.string().optional(),
  HTTPS_PROXY: z.string().optional(),
  HTTP_PROXY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    // In development, allow optional AI keys to be missing
    if (process.env.NODE_ENV === 'development') {
      console.warn('Running in development mode with partial config');
      return envSchema.parse({
        ...process.env,
        NODE_ENV: 'development',
      });
    }
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
