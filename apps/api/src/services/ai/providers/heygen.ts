// @memorylane/api - HeyGen AI Provider
// Supports: photo_animation (subtle_motion, talking, expression)
import type { AIProvider, AIRequest, AIPrediction, AIPredictionStatusResponse, AIResult } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fetch from 'node-fetch';

const HEYGEN_API_BASE = 'https://api.heygen.com';

interface HeyGenVideoTask {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
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

export class HeyGenProvider implements AIProvider {
  readonly name = 'heygen';

  readonly supportedServices: ServiceType[] = [
    ServiceType.PHOTO_ANIMATION,
  ];

  private apiKey: string;
  private agent: SocksProxyAgent | undefined;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.agent = getProxyAgent();
  }

  async createPrediction(request: AIRequest): Promise<AIPrediction> {
    const imageUrl = request.input.imageUrl || request.input.imageBase64;
    if (!imageUrl) {
      throw new Error('Image URL or base64 is required for photo animation');
    }

    const animationType = (request.input.params?.animationType as string) || 'subtle_motion';
    const audioText = request.input.audioText;
    const duration = request.input.duration || 10;

    // Build the video generation request
    const requestBody: Record<string, unknown> = {
      test: true, // Use test mode during development
      video_inputs: [{
        character: {
          type: 'talking_photo',
          talking_photo: {
            image_url: imageUrl,
          },
        },
        voice: {
          type: 'text' as const,
          input_text: audioText || this.getDefaultNarration(animationType, duration),
        },
      }],
      dimension: {
        width: 1080,
        height: 1920,
      },
    };

    // Add animation-specific settings
    if (animationType === 'subtle_motion') {
      // Subtle ambient motion - minimal camera movement
      (requestBody.video_inputs as any[])[0].voice.input_text =
        audioText || '';
      (requestBody.video_inputs as any[])[0].voice.type = 'text';
    }

    const fetchOptions: Record<string, unknown> = {
      method: 'POST',
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(requestBody),
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      `${HEYGEN_API_BASE}/v2/video/generate`,
      fetchOptions as Parameters<typeof fetch>[1],
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HeyGen API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as { data?: { id?: string }; id?: string };
    const videoId = data.data?.id || data.id;

    if (!videoId) {
      throw new Error('HeyGen API did not return a video ID');
    }

    return {
      id: videoId as string,
      status: 'starting',
      provider: this.name,
      createdAt: new Date(),
    };
  }

  async getPredictionStatus(predictionId: string): Promise<AIPredictionStatusResponse> {
    const fetchOptions: Record<string, unknown> = {
      headers: {
        'X-Api-Key': this.apiKey,
        Accept: 'application/json',
      },
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      `${HEYGEN_API_BASE}/v1/video_status.get?video_id=${predictionId}`,
      fetchOptions as Parameters<typeof fetch>[1],
    );

    if (!response.ok) {
      throw new Error(`HeyGen API error (${response.status})`);
    }

    const data = await response.json() as Record<string, unknown>;
    const status = data.data as HeyGenVideoTask;

    const mappedStatus = status.video_url ? 'succeeded'
      : status.status === 'failed' ? 'failed'
      : 'processing';

    return {
      id: predictionId,
      status: mappedStatus as AIPredictionStatusResponse['status'],
      provider: this.name,
      createdAt: new Date(),
      progress: status.video_url ? 100 : 50,
      error: status.error,
    };
  }

  async getPredictionResult(predictionId: string): Promise<AIResult> {
    const statusResponse = await this.getPredictionStatus(predictionId);

    if (statusResponse.status !== 'succeeded') {
      throw new Error(`Prediction ${predictionId} has not succeeded yet`);
    }

    // Re-fetch to get the video URL
    const fetchOptions: Record<string, unknown> = {
      headers: {
        'X-Api-Key': this.apiKey,
        Accept: 'application/json',
      },
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      `${HEYGEN_API_BASE}/v1/video_status.get?video_id=${predictionId}`,
      fetchOptions as Parameters<typeof fetch>[1],
    );

    const data = await response.json() as Record<string, unknown>;
    const task = data.data as HeyGenVideoTask;

    return {
      id: predictionId,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      progress: 100,
      outputs: {
        videoUrl: task.video_url,
      },
      metrics: {
        processingTimeMs: 0, // Not provided by HeyGen
        computeUnits: 1,
      },
    };
  }

  async cancelPrediction(predictionId: string): Promise<void> {
    // HeyGen doesn't provide a cancel API for individual videos
    console.warn(`[HeyGen] Cannot cancel prediction ${predictionId} — not supported by API`);
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

  private getDefaultNarration(animationType: string, _duration: number): string {
    switch (animationType) {
      case 'subtle_motion':
        return 'This moment captured in time, now gently brought to life.';
      case 'expression':
        return 'A cherished memory from days gone by, preserved forever.';
      case 'talking':
        return 'Hello there. This photograph holds a special place in our family history. Looking back at these times fills me with warmth and nostalgia.';
      default:
        return 'A beautiful memory, restored and animated for generations to come.';
    }
  }
}
