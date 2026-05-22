// @memorylane/api - OpenAI AI Provider
// Supports: historical_dating (GPT-4o Vision)
import type { AIProvider, AIRequest, AIPrediction, AIPredictionStatusResponse, AIResult } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fetch from 'node-fetch';

const OPENAI_API_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Get proxy agent if configured (supports socks5://, http://, https://)
 */
function getProxyAgent(): SocksProxyAgent | undefined {
  const proxyUrl = process.env.ALL_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxyUrl) return undefined;

  try {
    return new SocksProxyAgent(proxyUrl);
  } catch (err) {
    console.warn(`[OpenAI] Failed to create proxy agent for ${proxyUrl}:`, err);
    return undefined;
  }
}

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';

  readonly supportedServices: ServiceType[] = [
    ServiceType.HISTORICAL_DATING,
  ];

  private apiKey: string;
  private agent: SocksProxyAgent | undefined;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.agent = getProxyAgent();
    if (this.agent) {
      console.log('[OpenAI] Proxy enabled via SOCKS5/HTTP agent');
    }
  }

  async createPrediction(request: AIRequest): Promise<AIPrediction> {
    const result = await this.runVisionAnalysis(request);
    return {
      id: `openai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      ...result,
    } as AIPrediction & AIResult;
  }

  async getPredictionStatus(predictionId: string): Promise<AIPredictionStatusResponse> {
    return {
      id: predictionId,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      progress: 100,
    };
  }

  async getPredictionResult(predictionId: string): Promise<AIResult> {
    return {
      id: predictionId,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      outputs: {
        textResult: 'Result available from createPrediction',
      },
    };
  }

  async cancelPrediction(_predictionId: string): Promise<void> {
    // OpenAI doesn't support canceling running requests
  }

  /**
   * Run GPT-4o Vision analysis for historical dating
   */
  private async runVisionAnalysis(request: AIRequest): Promise<Partial<AIResult>> {
    const imageUrl = request.input.imageUrl || request.input.imageBase64;

    if (!imageUrl) {
      throw new Error('Image URL or base64 is required for historical dating');
    }

    const systemPrompt = `You are an expert photo historian specializing in dating historical photographs. Analyze the provided image and estimate:

1. **Estimated Year Range**: The most likely time period (e.g., "1920-1935")
2. **Confidence**: Your confidence level (high/medium/low)
3. **Key Indicators**: List the visual clues that support your dating:
   - Clothing and fashion styles
   - Photographic process (daguerreotype, tintype, cabinet card, etc.)
   - Props, furniture, or background details
   - Hairstyles and accessories
   - Print or mounting style
4. **Description**: A brief description of the scene
5. **Historical Context**: Any relevant historical context for the estimated period

Respond in valid JSON format with these fields: estimated_year_range, confidence, key_indicators (array of strings), description, historical_context.`;

    const fetchOptions: any = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this historical photograph and estimate its date of origin.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    };

    // Use proxy agent if available (node-fetch supports agent option)
    if (this.agent) {
      fetchOptions.agent = this.agent;
    }

    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices[0]?.message?.content || '{}';

    try {
      const jsonResult = JSON.parse(content);
      return {
        outputs: {
          textResult: content,
          jsonResult,
        },
        metrics: {
          processingTimeMs: 0,
          computeUnits: 0,
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        },
      };
    } catch {
      return {
        outputs: {
          textResult: content,
        },
        metrics: {
          processingTimeMs: 0,
          computeUnits: 0,
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        },
      };
    }
  }
}
