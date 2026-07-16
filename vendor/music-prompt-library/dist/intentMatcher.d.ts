import type { QueryIntent } from "./intent/types.js";
import type { IntentScoreBreakdown, MusicProfile, MusicPrimaryRole } from "./types.js";
export type IntentMatch = {
    profile: MusicProfile;
    score: number;
    score_breakdown: IntentScoreBreakdown;
    matched_attributes: {
        application_fit: string[];
        usage: string[];
        mood: string[];
        music_role: MusicPrimaryRole[];
        semantic_keywords: string[];
        audio_character: string[];
        energy_level?: {
            requested: number;
            profile: 1 | 2 | 3 | 4 | 5;
        };
        duration?: {
            requested: number;
            supported: boolean;
        };
    };
};
export declare function scoreIntentProfile(profile: MusicProfile, intent: QueryIntent): IntentMatch;
export declare function matchIntent(intent: QueryIntent, limit?: number): Promise<IntentMatch[]>;
export declare function rankIntentAgainstProfiles(intent: QueryIntent, profiles: MusicProfile[], limit?: number): IntentMatch[];
