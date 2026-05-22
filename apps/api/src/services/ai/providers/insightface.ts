// @memorylane/api - InsightFace AI Provider
// Supports: face_match (face detection & matching across multiple photos)
import type { AIProvider, AIRequest, AIPrediction, AIPredictionStatusResponse, AIResult } from '@memorylane/shared';
import { ServiceType } from '@memorylane/shared';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fetch from 'node-fetch';

/**
 * Face match result for a single person
 */
interface MatchedPerson {
  personId: string;
  confidence: number;
  photos: Array<{
    uploadId: string;
    imageUrl: string;
    detectedFace: { x: number; y: number; width: number; height: number };
  }>;
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

export class InsightFaceProvider implements AIProvider {
  readonly name = 'insightface';

  readonly supportedServices: ServiceType[] = [
    ServiceType.FACE_MATCH,
  ];

  private apiUrl: string;
  private apiKey?: string;
  private agent: SocksProxyAgent | undefined;

  constructor(apiUrl: string, apiKey?: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
    this.agent = getProxyAgent();
  }

  async createPrediction(request: AIRequest): Promise<AIPrediction> {
    const imageUrls = request.input.imageUrls || (request.input.imageUrl ? [request.input.imageUrl] : []);

    if (imageUrls.length < 2) {
      throw new Error('At least 2 images are required for face matching');
    }

    const result = await this.runFaceMatch(imageUrls);

    return {
      id: `face-match-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      status: 'succeeded',
      provider: this.name,
      createdAt: new Date(),
      progress: 100,
      outputs: {
        textResult: JSON.stringify(result.matchedGroups, null, 2),
        jsonResult: { matchedGroups: result.matchedGroups, totalFaces: result.totalFaces },
      },
      metrics: {
        processingTimeMs: result.processingTimeMs,
        computeUnits: 1,
      },
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
        textResult: 'Face match results available from createPrediction',
      },
    };
  }

  async cancelPrediction(_predictionId: string): Promise<void> {
    // InsightFace is synchronous — nothing to cancel
  }

  /**
   * Run face detection and matching across multiple images
   * Uses the InsightFace API (self-deployed or hosted)
   *
   * Fallback: If the self-deployed API is not available,
   * uses Replicate's face analysis model as fallback
   */
  private async runFaceMatch(imageUrls: string[]): Promise<{
    matchedGroups: MatchedPerson[];
    totalFaces: number;
    processingTimeMs: number;
  }> {
    try {
      // Try self-deployed InsightFace API first
      return await this.matchWithInsightFaceAPI(imageUrls);
    } catch (err) {
      console.warn(`[InsightFace] Self-hosted API unavailable: ${(err as Error).message}`);
      console.warn('[InsightFace] Falling back to Replicate face analysis');

      // Fallback to Replicate face analysis
      return await this.matchWithReplicateFallback(imageUrls);
    }
  }

  /**
   * Match faces using self-deployed InsightFace API
   */
  private async matchWithInsightFaceAPI(imageUrls: string[]): Promise<{
    matchedGroups: MatchedPerson[];
    totalFaces: number;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const fetchOptions: Record<string, unknown> = {
      method: 'POST',
      headers,
      body: JSON.stringify({
        images: imageUrls,
        threshold: 0.6, // Cosine similarity threshold for matching
      }),
    };

    if (this.agent) {
      (fetchOptions as any).agent = this.agent;
    }

    const response = await fetch(
      `${this.apiUrl}/api/face-match`,
      fetchOptions as Parameters<typeof fetch>[1],
    );

    if (!response.ok) {
      throw new Error(`InsightFace API error (${response.status})`);
    }

    const data = await response.json() as Record<string, unknown>;
    const groups = (data.groups || data.matched_groups || []) as Array<Record<string, unknown>>;

    const matchedGroups: MatchedPerson[] = groups.map((group, idx) => ({
      personId: `person-${idx + 1}`,
      confidence: (group.avg_confidence as number) || 0,
      photos: ((group.photos || []) as Array<Record<string, unknown>>).map((photo) => ({
        uploadId: photo.upload_id as string || '',
        imageUrl: photo.image_url as string || '',
        detectedFace: {
          x: (photo.bbox as number[])?.[0] || 0,
          y: (photo.bbox as number[])?.[1] || 0,
          width: (photo.bbox as number[])?.[2] || 0,
          height: (photo.bbox as number[])?.[3] || 0,
        },
      })),
    }));

    return {
      matchedGroups,
      totalFaces: (data.total_faces as number) || 0,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Fallback: Use Replicate's face detection model for basic matching
   */
  private async matchWithReplicateFallback(imageUrls: string[]): Promise<{
    matchedGroups: MatchedPerson[];
    totalFaces: number;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const replicateToken = process.env.REPLICATE_API_TOKEN;

    if (!replicateToken) {
      throw new Error('No Replicate API token available for InsightFace fallback');
    }

    // Use a face detection model on Replicate to extract face embeddings
    const faces: Array<{
      imageUrl: string;
      embedding: number[];
      bbox: { x: number; y: number; w: number; h: number };
    }> = [];

    // Process each image through Replicate face analysis
    for (const imageUrl of imageUrls) {
      try {
        const response = await fetch(
          'https://api.replicate.com/v1/models/xinntao/insightface/versions/v1.0/predictions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${replicateToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: { image: imageUrl },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json() as Record<string, unknown>;
          const output = data.output as Record<string, unknown>;

          if (output?.faces && Array.isArray(output.faces)) {
            for (const face of output.faces as Array<Record<string, unknown>>) {
              faces.push({
                imageUrl,
                embedding: (face.embedding as number[]) || [],
                bbox: {
                  x: (face.bbox as number[])?.[0] || 0,
                  y: (face.bbox as number[])?.[1] || 0,
                  w: (face.bbox as number[])?.[2] || 0,
                  h: (face.bbox as number[])?.[3] || 0,
                },
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[InsightFace] Failed to process image: ${(err as Error).message}`);
      }
    }

    // Match faces by cosine similarity
    const matchedGroups = this.clusterFaces(faces);

    return {
      matchedGroups,
      totalFaces: faces.length,
      processingTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Cluster faces by cosine similarity using simple greedy approach
   */
  private clusterFaces(
    faces: Array<{ imageUrl: string; embedding: number[]; bbox: { x: number; y: number; w: number; h: number } }>,
  ): MatchedPerson[] {
    const THRESHOLD = 0.6;
    const groups: MatchedPerson[] = [];
    const assigned = new Set<number>();

    for (let i = 0; i < faces.length; i++) {
      if (assigned.has(i)) continue;

      const group: MatchedPerson = {
        personId: `person-${groups.length + 1}`,
        confidence: 0,
        photos: [],
      };

      const photoIndices = [i];

      for (let j = i + 1; j < faces.length; j++) {
        if (assigned.has(j)) continue;

        const similarity = this.cosineSimilarity(faces[i].embedding, faces[j].embedding);
        if (similarity >= THRESHOLD) {
          photoIndices.push(j);
        }
      }

      let totalConfidence = 0;
      for (const idx of photoIndices) {
        assigned.add(idx);
        const face = faces[idx];
        const similarity = idx === i ? 1.0 : this.cosineSimilarity(faces[i].embedding, face.embedding);
        totalConfidence += similarity;
        group.photos.push({
          uploadId: '', // Will be filled by worker from job data
          imageUrl: face.imageUrl,
          detectedFace: {
            x: face.bbox.x,
            y: face.bbox.y,
            width: face.bbox.w,
            height: face.bbox.h,
          },
        });
      }

      group.confidence = totalConfidence / photoIndices.length;
      groups.push(group);
    }

    return groups;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length === 0 || b.length === 0 || a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}
