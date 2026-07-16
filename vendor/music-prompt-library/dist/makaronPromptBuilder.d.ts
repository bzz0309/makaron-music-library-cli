import type { MakaronPromptResult, MusicPrimaryRole, VocalType } from "./types.js";
export declare function generateMakaronPrompt(input: {
    userPrompt: string;
    scene?: string;
    contentScene?: string;
    duration?: number;
    mood?: string;
    energy?: number;
    energyLevel?: number;
    usage?: string;
    musicRole?: MusicPrimaryRole;
    vocalType?: VocalType;
}): Promise<MakaronPromptResult>;
