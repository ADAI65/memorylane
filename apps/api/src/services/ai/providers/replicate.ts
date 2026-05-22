// @memorylane/api - Replicate AI Provider
// Supports: basic_restoration, era_colorization, super_resolution
import type { AIProvider, AIRequest, AIPrediction, AIPredictionStatusResponse, AIResult } from '@memorylane/shared';
import { ServiceType, REPLICATE_MODELS } from '@memorylane/shared';

const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

export class ReplicateProvider implements AIProvider {
  readonly name = 'replicate';

  readonly supportedServices: ServiceType[] = [
    ServiceType.BASIC_RESTORATION,
    ServiceType.ERA_COLORIZATION,
  ];

  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async createPrediction(request: AIRequest): Promise<AIPrediction> {
    const modelConfig = REPLICATE_MODELS[request.model];
    if (!modelConfig) {
      throw new Error(`Unknown Replicate model: ${request.model}`);
    }

    const input: Record<string, unknown> = {
      image: request.input.imageUrl || request.input.imageBase64,
      ...request.input.params,
    };

    // Add scale parameter for super resolution models
    if (!input.scale) {
      input.scale = 2;
    }

    const response = await fetch(
      `${REPLICATE_API_BASE}/models/${modelConfig.owner}/${modelConfig.name}/versions/${modelConfig.version}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          Prefer: 'wait', // Wait for initial validation
        },
        body: JSON.stringify({
          input,
          ...(request.webhookUrl && {
            webhook: request.webhookUrl,
            webhook_events_filter: ['completed', 'failed'],
          }),
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Replicate API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      id: data.id as string,
      status: (data.status as AIPrediction['status']) || 'starting',
      provider: this.name,
      createdAt: new Date(data.created_at as string),
    };
  }

  async getPredictionStatus(predictionId: string): Promise<AIPredictionStatusResponse> {
    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate API error (${response.status})`);
    }

    const data = await response.json() as Record<string, unknown>;
    const logs = data.logs as string | undefined;

    return {
      id: data.id as string,
      status: data.status as AIPredictionStatusResponse['status'],
      provider: this.name,
      createdAt: new Date(data.created_at as string),
      progress: this.parseProgress(data.status as string, data.output),
      logs,
      error: data.error as string | undefined,
    };
  }

  async getPredictionResult(predictionId: string): Promise<AIResult> {
    const response = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Replicate API error (${response.status})`);
    }

    const data = await response.json() as Record<string, unknown>;
    const output = data.output as string | string[] | null;

    // Parse output based on model type
    const outputs: AIResult['outputs'] = {};

    if (typeof output === 'string' && output.startsWith('http')) {
      outputs.imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0 && typeof output[0] === 'string') {
      outputs.imageUrls = output;
    } else if (typeof output === 'string' && output.startsWith('data:')) {
      // Base64 data URL
      outputs.imageUrl = output;
    }

    const startTime = new Date(data.created_at as string).getTime();
    const completedAt = data.completed_at ? new Date(data.completed_at as string).getTime() : Date.now();

    return {
      id: data.id as string,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(data.created_at as string),
      outputs,
      metrics: {
        processingTimeMs: completedAt - startTime,
        computeUnits: parseFloat((data.metrics as Record<string, string>)?.compute_time || '0'),
      },
    };
  }

  async cancelPrediction(predictionId: string): Promise<void> {
    await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });
  }

  /**
   * Parse progress from status/output (Replicate doesn't provide fine-grained progress)
   */
  private parseProgress(status: string, _output: unknown): number {
    switch (status) {
      case 'starting': return 10;
      case 'processing': return 50;
      case 'succeeded': return 100;
      case 'failed': return 0;
      case 'canceled': return 0;
      default: return 0;
    }
  }

  /**
   * Download image bytes from a URL
   */
  async downloadOutput(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image from ${url}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
