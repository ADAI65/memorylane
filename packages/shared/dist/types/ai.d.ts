import type { ServiceType, AIPredictionStatus } from './enums.js';
export interface AIProvider {
    readonly name: string;
    readonly supportedServices: ServiceType[];
    createPrediction(request: AIRequest): Promise<AIPrediction>;
    getPredictionStatus(predictionId: string): Promise<AIPredictionStatusResponse>;
    getPredictionResult(predictionId: string): Promise<AIResult>;
    cancelPrediction(predictionId: string): Promise<void>;
}
export interface AIRequest {
    serviceType: ServiceType;
    model: string;
    input: {
        imageUrl?: string;
        imageBase64?: string;
        imageUrls?: string[];
        prompt?: string;
        audioText?: string;
        duration?: number;
        params?: Record<string, unknown>;
    };
    webhookUrl?: string;
}
export interface AIPrediction {
    id: string;
    status: AIPredictionStatus;
    provider: string;
    createdAt: Date;
}
export interface AIPredictionStatusResponse extends AIPrediction {
    progress?: number;
    logs?: string;
    error?: string;
}
export interface AIResult extends AIPredictionStatusResponse {
    outputs: {
        imageUrl?: string;
        imageUrls?: string[];
        videoUrl?: string;
        audioUrl?: string;
        textResult?: string;
        jsonResult?: Record<string, unknown>;
        pdfBytes?: Uint8Array;
    };
    metrics?: {
        processingTimeMs: number;
        computeUnits: number;
        inputTokens?: number;
        outputTokens?: number;
    };
}
export interface AIConfig {
    replicateApiToken?: string;
    openaiApiKey?: string;
    heygenApiKey?: string;
    runwayApiKey?: string;
    elevenlabsApiKey?: string;
    insightfaceApiUrl?: string;
    insightfaceApiKey?: string;
}
//# sourceMappingURL=ai.d.ts.map