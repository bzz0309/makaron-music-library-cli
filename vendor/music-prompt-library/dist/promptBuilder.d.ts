import type { MusicPrimaryRole, SeedAudioPromptResult, VocalType } from "./types.js";
export declare function generateSeedAudioPrompt(input: {
    scene?: string;
    contentScene?: string;
    duration?: number;
    mood?: string;
    energy?: number;
    energyLevel?: number;
    usage?: string;
    musicRole?: MusicPrimaryRole;
    vocalType?: VocalType;
}): Promise<SeedAudioPromptResult>;
