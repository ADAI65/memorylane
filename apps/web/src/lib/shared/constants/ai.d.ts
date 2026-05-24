import { ServiceType } from '../types/enums.js';
export declare const AI_MODELS: {
    readonly GFPGAN: "gfpgan";
    readonly CODEFORMER: "codeformer";
    readonly SWINIR: "swinir";
    readonly DEOLDIFY: "deoldify";
    readonly REAL_ESRGAN: "real_esrgan";
    readonly HEYGEN_PHOTO_ANIMATION: "heygen/photo_animation";
    readonly D_ID_TALKING_HEAD: "d_id/talking_head";
    readonly GPT4O_VISION: "gpt-4o-vision";
    readonly RUNWAY_GEN2: "runway/gen-2";
    readonly RUNWAY_GEN3_ALPHA: "runway/gen-3-alpha";
    readonly ELEVEN_TURBO_V2: "eleven_turbo_v2";
    readonly ELEVEN_MONOLINGUAL_V1: "eleven_monolingual_v1";
    readonly INSIGHTFACE_ARCFACE: "insightface/arcface";
};
export declare const DEFAULT_MODEL_PER_SERVICE: Record<ServiceType, string>;
export declare const REPLICATE_MODELS: Record<string, {
    owner: string;
    name: string;
    version: string;
}>;
//# sourceMappingURL=ai.d.ts.map