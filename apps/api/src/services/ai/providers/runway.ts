// @memorylane/api - Runway AI Provider
// Supports: memory_video (cinematic slideshow with AI narration)
import type { AIProvider, AIRequest, AIPrediction, AIPredictionStatusResponse, AIResult } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fetch from 'node-fetch';

const RUNWAY_API_BASE = 'https://api.dev.runwayml.com/v1';

interface RunwayTaskResponse {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  output?: string[];
  error?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get proxy agent if configured
 */
function getProxyAgent(): SocksProxyAgent | undefined {
  const proxyUrl = process.env.ALL_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxyUrl) return undefined;
  try {
    return new SocksProxyAgent(proxyUrl);
  } catch {
    return undefined;
  }
}

export class RunwayProvider implements AIProvider {
  readonly name = 'runway';

  readonly supportedServices: ServiceType[] = [
    ServiceType.MEMORY_VIDEO,
  ];

  private apiKey: string;
  private elevenlabsKey?: string;
  private agent: SocksProxyAgent | undefined;

  constructor(apiKey: string, elevenlabsKey?: string) {
    this.apiKey = apiKey;
    this.elevenlabsKey = elevenlabsKey;
    this.agent = getProxyAgent();
  }

  async createPrediction(request: AIRequest): Promise<AIPrediction> {
    const imageUrls = request.input.imageUrls || (request.input.imageUrl ? [request.input.imageUrl] : []);
    if (imageUrls.length === 0) {
      throw new Error('At least one image URL is required for memory video generation');
    }

    const prompt = request.input.prompt ||
      'A cinematic, nostalgic slideshow video of vintage photographs. Slow, gentle camera movements with warm color grading. Historical atmosphere with soft ambient lighting. Professional archival documentary style.';

    const duration = request.input.duration || 10; // seconds

    // Step 1: Generate narration audio with ElevenLabs (if key available)
    if (this.elevenlabsKey) {
      await this.generateNarration(request.input.audioText || prompt);
    }

    // Step 2: Create Runway image-to-video task
    // Use the first image as the primary source
    const primaryImage = imageUrls[0];

    const taskBody: Record<string, unknown> = {
      model: 'gen3a_turbo',
      promptText: prompt,
      duration: Math.min(duration, 10), // Gen-3 Alpha max 10s per generation
      ratio: '16:9',
      // First frame image
      ...(primaryImage && { firstFrameImage: primaryImage }),
    };

    const fetchOptions: Record<string, unknown> = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(taskBody),
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      `${RUNWAY_API_BASE}/image_to_video`,
      fetchOptions as Parameters<typeof fetch>[1],
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Runway API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as RunwayTaskResponse;

    return {
      id: data.id,
      status: 'starting',
      provider: this.name,
      createdAt: new Date(data.createdAt),
    };
  }

  async getPredictionStatus(predictionId: string): Promise<AIPredictionStatusResponse> {
    const fetchOptions: Record<string, unknown> = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      `${RUNWAY_API_BASE}/tasks/${predictionId}`,
      fetchOptions as Parameters<typeof fetch>[1],
    );

    if (!response.ok) {
      throw new Error(`Runway API error (${response.status})`);
    }

    const data = await response.json() as RunwayTaskResponse;

    const statusMap: Record<string, AIPredictionStatusResponse['status']> = {
      'PENDING': 'starting',
      'RUNNING': 'processing',
      'SUCCEEDED': 'succeeded',
      'FAILED': 'failed',
      'CANCELLED': 'canceled',
    };

    const progressMap: Record<string, number> = {
      'PENDING': 10,
      'RUNNING': 50,
      'SUCCEEDED': 100,
      'FAILED': 0,
      'CANCELLED': 0,
    };

    return {
      id: data.id,
      status: statusMap[data.status] || 'starting',
      provider: this.name,
      createdAt: new Date(data.createdAt),
      progress: progressMap[data.status] || 0,
      error: data.error,
    };
  }

  async getPredictionResult(predictionId: string): Promise<AIResult> {
    const fetchOptions: Record<string, unknown> = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      `${RUNWAY_API_BASE}/tasks/${predictionId}`,
      fetchOptions as Parameters<typeof fetch>[1],
    );

    const data = await response.json() as RunwayTaskResponse;

    if (data.status !== 'SUCCEEDED' || !data.output || data.output.length === 0) {
      throw new Error(`Task ${predictionId} has not succeeded or has no output`);
    }

    const createdAt = new Date(data.createdAt).getTime();
    const updatedAt = new Date(data.updatedAt).getTime();

    return {
      id: data.id,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(data.createdAt),
      progress: 100,
      outputs: {
        videoUrl: data.output[0],
      },
      metrics: {
        processingTimeMs: updatedAt - createdAt,
        computeUnits: 1,
      },
    };
  }

  async cancelPrediction(predictionId: string): Promise<void> {
    const fetchOptions: Record<string, unknown> = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    await fetch(
      `${RUNWAY_API_BASE}/tasks/${predictionId}`,
      fetchOptions as Parameters<typeof fetch>[1],
    );
  }

  /**
   * Download video bytes from a URL
   */
  async downloadOutput(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download video from ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Generate narration audio using ElevenLabs TTS
   */
  private async generateNarration(text: string): Promise<string> {
    if (!this.elevenlabsKey) {
      throw new Error('ElevenLabs API key is required for narration generation');
    }

    const fetchOptions: Record<string, unknown> = {
      method: 'POST',
      headers: {
        'xi-api-key': this.elevenlabsKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.slice(0, 5000), // ElevenLabs max 5000 chars
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Rachel voice
      fetchOptions as Parameters<typeof fetch>[1],
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error (${response.status})`);
    }

    // Return the audio as a base64 data URL (we'll upload it to Supabase storage later)
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:audio/mpeg;base64,${base64}`;
  }
}
