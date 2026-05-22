// @memorylane/api - AI Service abstraction layer
import type { AIProvider, AIRequest, AIPrediction, AIResult } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';
import { env } from '../../env.js';

// ── Provider Registry ────────────────────────────────────

const providerRegistry = new Map<string, AIProvider>();

/**
 * Register an AI provider
 */
export function registerProvider(provider: AIProvider): void {
  providerRegistry.set(provider.name, provider);
}

/**
 * Get a provider by name
 */
export function getProvider(name: string): AIProvider {
  const provider = providerRegistry.get(name);
  if (!provider) {
    throw new Error(`AI provider "${name}" not registered`);
  }
  return provider;
}

/**
 * Get the appropriate provider for a service type
 */
export function getProviderForService(serviceType: ServiceType): AIProvider {
  for (const provider of providerRegistry.values()) {
    if (provider.supportedServices.includes(serviceType)) {
      return provider;
    }
  }
  throw new Error(`No AI provider registered for service type "${serviceType}"`);
}

/**
 * Check if a provider is configured and available
 */
export function isProviderAvailable(name: string): boolean {
  return providerRegistry.has(name);
}

// ── Convenience Wrappers ─────────────────────────────────

/**
 * Create a prediction and return the prediction object
 */
export async function createPrediction(request: AIRequest): Promise<AIPrediction> {
  const provider = getProviderForService(request.serviceType);
  return provider.createPrediction(request);
}

/**
 * Poll a prediction until completion (with timeout)
 */
export async function waitForPrediction(
  providerName: string,
  predictionId: string,
  options: {
    timeoutMs?: number;
    pollIntervalMs?: number;
    onProgress?: (progress: number) => void;
  } = {},
): Promise<AIResult> {
  const {
    timeoutMs = 5 * 60 * 1000, // 5 min default
    pollIntervalMs = 3000,
    onProgress,
  } = options;

  const provider = getProvider(providerName);
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const statusResponse = await provider.getPredictionStatus(predictionId);

    if (statusResponse.progress && onProgress) {
      onProgress(statusResponse.progress);
    }

    if (statusResponse.status === 'succeeded') {
      return provider.getPredictionResult(predictionId);
    }

    if (statusResponse.status === 'failed' || statusResponse.status === 'canceled') {
      throw new Error(
        statusResponse.error || `Prediction ${statusResponse.status}`,
      );
    }

    // Wait before polling again
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Prediction timed out after ${timeoutMs}ms`);
}

// ── Lazy Provider Initialization ─────────────────────────

let providersInitialized = false;

/**
 * Initialize all available providers based on environment configuration
 */
export async function initializeProviders(): Promise<void> {
  if (providersInitialized) return;

  // Replicate provider (used for: basic_restoration, era_colorization, super_resolution)
  if (env.REPLICATE_API_TOKEN) {
    const { ReplicateProvider } = await import('./providers/replicate.js');
    const replicate = new ReplicateProvider(env.REPLICATE_API_TOKEN);
    registerProvider(replicate);
    console.log('[AI] Replicate provider registered');
  } else {
    console.warn('[AI] REPLICATE_API_TOKEN not set — Replicate provider skipped');
  }

  // OpenAI provider (used for: historical_dating)
  if (env.OPENAI_API_KEY) {
    const { OpenAIProvider } = await import('./providers/openai.js');
    const openai = new OpenAIProvider(env.OPENAI_API_KEY);
    registerProvider(openai);
    console.log('[AI] OpenAI provider registered');
  } else {
    console.warn('[AI] OPENAI_API_KEY not set — OpenAI provider skipped');
  }

  // HeyGen provider (used for: photo_animation)
  if (env.HEYGEN_API_KEY) {
    const { HeyGenProvider } = await import('./providers/heygen.js');
    const heygen = new HeyGenProvider(env.HEYGEN_API_KEY);
    registerProvider(heygen);
    console.log('[AI] HeyGen provider registered');
  } else {
    console.warn('[AI] HEYGEN_API_KEY not set — HeyGen provider skipped (Photo Animation unavailable)');
  }

  // Runway provider (used for: memory_video)
  if (env.RUNWAY_API_KEY) {
    const { RunwayProvider } = await import('./providers/runway.js');
    const runway = new RunwayProvider(env.RUNWAY_API_KEY, env.ELEVENLABS_API_KEY);
    registerProvider(runway);
    console.log('[AI] Runway provider registered');
  } else {
    console.warn('[AI] RUNWAY_API_KEY not set — Runway provider skipped (Memory Video unavailable)');
  }

  // InsightFace provider (used for: face_match)
  if (env.INSIGHTFACE_API_URL) {
    const { InsightFaceProvider } = await import('./providers/insightface.js');
    const insightface = new InsightFaceProvider(env.INSIGHTFACE_API_URL, env.INSIGHTFACE_API_KEY);
    registerProvider(insightface);
    console.log('[AI] InsightFace provider registered');
  } else {
    console.warn('[AI] INSIGHTFACE_API_URL not set — InsightFace provider skipped (Face Match unavailable)');
  }

  // Certificate provider (used for: certificate) — always available (local PDF generation)
  {
    const { CertificateProvider } = await import('./providers/certificate.js');
    const certificate = new CertificateProvider();
    registerProvider(certificate);
    console.log('[AI] Certificate provider registered (local)');
  }

  providersInitialized = true;
  console.log(`[AI] ${providerRegistry.size} provider(s) initialized`);
}
