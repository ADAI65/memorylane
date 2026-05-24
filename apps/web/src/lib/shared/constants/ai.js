import { ServiceType } from '../types/enums.js';
// AI model identifiers
export const AI_MODELS = {
    // Replicate models
    GFPGAN: 'gfpgan',
    CODEFORMER: 'codeformer',
    SWINIR: 'swinir',
    DEOLDIFY: 'deoldify',
    REAL_ESRGAN: 'real_esrgan',
    // HeyGen models
    HEYGEN_PHOTO_ANIMATION: 'heygen/photo_animation',
    D_ID_TALKING_HEAD: 'd_id/talking_head',
    // OpenAI models
    GPT4O_VISION: 'gpt-4o-vision',
    // Runway models
    RUNWAY_GEN2: 'runway/gen-2',
    RUNWAY_GEN3_ALPHA: 'runway/gen-3-alpha',
    // ElevenLabs models
    ELEVEN_TURBO_V2: 'eleven_turbo_v2',
    ELEVEN_MONOLINGUAL_V1: 'eleven_monolingual_v1',
    // InsightFace
    INSIGHTFACE_ARCFACE: 'insightface/arcface',
};
// Default model per service type
export const DEFAULT_MODEL_PER_SERVICE = {
    [ServiceType.BASIC_RESTORATION]: AI_MODELS.GFPGAN,
    [ServiceType.PHOTO_ANIMATION]: AI_MODELS.HEYGEN_PHOTO_ANIMATION,
    [ServiceType.MEMORY_VIDEO]: AI_MODELS.RUNWAY_GEN3_ALPHA,
    [ServiceType.HISTORICAL_DATING]: AI_MODELS.GPT4O_VISION,
    [ServiceType.ERA_COLORIZATION]: AI_MODELS.DEOLDIFY,
    [ServiceType.FACE_MATCH]: AI_MODELS.INSIGHTFACE_ARCFACE,
    [ServiceType.CERTIFICATE]: 'puppeteer/pdf',
};
// Replicate model version hashes
export const REPLICATE_MODELS = {
    [AI_MODELS.GFPGAN]: {
        owner: 'tencentarc',
        name: 'gfpgan',
        version: '9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
    },
    [AI_MODELS.CODEFORMER]: {
        owner: 'sczhou',
        name: 'codeformer',
        version: '7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56',
    },
    [AI_MODELS.SWINIR]: {
        owner: 'jingyunliang',
        name: 'swinir',
        version: '660d922bd3d97c14c11b1c3f0f9a479a3c47ebd79d4f2308e3f24be7f06a0e0',
    },
    [AI_MODELS.DEOLDIFY]: {
        owner: 'arielreplicate',
        name: 'deoldify',
        version: '0e77c4ba0e9bd5c5f5b7857fd4f62abab1a61e3c91b36e11a1ba0e85f6d5e19c',
    },
    [AI_MODELS.REAL_ESRGAN]: {
        owner: 'nightmareai',
        name: 'real-esrgan',
        version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
    },
};
//# sourceMappingURL=ai.js.map