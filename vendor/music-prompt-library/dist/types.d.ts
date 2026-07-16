import type { QueryIntent } from "./intent/types.js";
import type { ConversationTurn, WorkflowContext } from "./workflow/types.js";
export type VocalType = "vocal" | "instrumental" | "mixed" | "none" | "unknown";
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type ProfileStatus = "active" | "draft" | "deprecated";
export type TempoFeel = "slow" | "medium" | "fast" | "fast_paced" | "variable";
export type Loopability = "low" | "medium" | "high";
export type IntensityCurve = "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger";
export type AudioDensity = "sparse" | "medium" | "dense";
export type AudioBrightness = "dark" | "neutral" | "bright";
export type AudioWarmth = "cold" | "neutral" | "warm";
export type AudioPunch = "soft" | "medium" | "hard";
export type AudioSpace = "dry" | "roomy" | "wide" | "cinematic";
export type AudioPolish = "raw" | "clean" | "premium";
export type MusicPrimaryRole = "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
export type GenerationPrompt = {
    music_prompt: string;
    sound_effect_prompt?: string;
    negative_prompt?: string;
    producer_notes?: string;
    arrangement_notes?: string;
};
export type MusicProfile = {
    metadata: {
        id: string;
        title: string;
        description?: string;
        version: "1.2";
        status: ProfileStatus;
        legacy_ids?: string[];
        aliases?: string[];
        semantic_keywords: string[];
        tags?: string[];
    };
    music_identity: {
        genre: string[];
        sub_genre?: string[];
        mood: string[];
        energy_level: EnergyLevel;
        bpm?: number;
        bpm_range?: [number, number];
        tempo_feel?: TempoFeel;
        rhythm?: string[];
        instrumentation?: string[];
        vocal_type: VocalType;
        language?: string[];
        structure?: string[];
        loopability?: Loopability;
        intensity_curve?: IntensityCurve;
    };
    audio_character: {
        texture?: string[];
        timbre?: string[];
        density?: AudioDensity;
        brightness?: AudioBrightness;
        warmth?: AudioWarmth;
        punch?: AudioPunch;
        space?: AudioSpace;
        polish?: AudioPolish;
    };
    music_role: {
        primary_role: MusicPrimaryRole;
        secondary_roles?: MusicPrimaryRole[];
        narrative_function?: string[];
        edit_function?: string[];
        emotional_function?: string[];
    };
    application_fit: {
        domains: string[];
        usage_context: string[];
        content_types?: string[];
        audience_context?: string[];
        platform_context?: string[];
        recommended_duration_seconds: number[];
        pacing_fit?: string[];
        visual_energy_fit?: string[];
    };
    generation_prompt: GenerationPrompt;
};
export type AdapterType = "seed_audio_prompt" | "background_music_prompt" | "transition_music_prompt" | "music_brief" | "intro_music_prompt" | "climax_music_prompt" | "music_generation_brief";
export type QueryAdapter = "generic" | "makaron" | "video_editor" | "short_video_agent";
export type AgentAdapterProfile = {
    profile_id: string;
    adapters: {
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string;
        };
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string;
        };
        short_video_agent?: {
            type: "intro_music_prompt" | "background_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string;
        };
        generic?: {
            type: "music_generation_brief";
        };
    };
};
export type SearchInput = {
    scene?: string;
    contentScene?: string;
    duration?: number;
    mood?: string;
    energy?: number;
    energyLevel?: number;
    usage?: string;
    musicRole?: MusicPrimaryRole;
    vocalType?: VocalType;
    agent?: string;
    semanticQuery?: string;
    limit?: number;
};
type WorkflowRequestBase = {
    duration?: number;
    workflow_context?: WorkflowContext;
};
export type WorkflowRequest = WorkflowRequestBase & ({
    request: string;
    turns?: never;
} | {
    request?: never;
    turns: ConversationTurn[];
});
export type RecommendInput = WorkflowRequest & {
    limit?: number;
};
export type QueryInput = WorkflowRequest;
export type RecommendResult = {
    status: "ok";
    profile_id: string;
    score: number;
    intent: QueryIntent;
    score_breakdown: IntentScoreBreakdown;
    reason: string;
    reasoning_summary: string;
    why_selected: WhySelectedEvidence[];
    why_not: WhyNotProfile[];
    alternative_profiles: AlternativeProfile[];
    matched: RecommendationMatchEvidence[];
    rejected: RejectedRecommendation[];
    confidence: RecommendationConfidence;
    matched_attributes: {
        application_fit: string[];
        usage: string[];
        mood: string[];
        energy_level?: {
            requested: number;
            profile: EnergyLevel;
        };
        music_role: MusicPrimaryRole[];
        duration?: {
            requested: number;
            supported: boolean;
        };
        semantic_keywords: string[];
        audio_character: string[];
    };
    music_prompt: string;
    arrangement_notes: string;
    recommended_usage: string;
};
export type RecommendationMatchEvidence = {
    dimension: Exclude<keyof IntentScoreBreakdown, "penalties">;
    requested: string[];
    profile_value: string[];
    contribution: number;
    evidence: string[];
};
export type RejectedRecommendation = {
    profile_id: string;
    score: number;
    reasons: string[];
};
export type WhySelectedEvidence = {
    dimension: Exclude<keyof IntentScoreBreakdown, "penalties">;
    contribution: number;
    matched_values: string[];
    evidence: string[];
    summary: string;
};
export type WhyNotProfile = {
    profile_id: string;
    score: number;
    score_gap: number;
    reasons: string[];
    missing_evidence: string[];
};
export type AlternativeProfile = {
    profile_id: string;
    score: number;
    tradeoffs: string[];
};
export type RecommendationConfidence = {
    overall: number;
    level: "low" | "medium" | "high";
    intent_coverage: number;
    evidence_specificity: number;
    ranking_margin: number;
    constraint_satisfaction: number;
};
export type IntentScoreBreakdown = {
    application_fit: number;
    usage_context: number;
    music_role: number;
    semantic_keywords: number;
    mood: number;
    audio_character: number;
    energy_level: number;
    duration: number;
    penalties: number;
};
export type QueryResult = Pick<RecommendResult, "profile_id" | "score" | "intent" | "score_breakdown" | "reason" | "reasoning_summary" | "why_selected" | "why_not" | "alternative_profiles" | "matched" | "rejected" | "confidence" | "matched_attributes" | "music_prompt" | "arrangement_notes">;
type AdaptedQueryBase = Pick<RecommendResult, "profile_id" | "score" | "intent" | "score_breakdown" | "reason" | "reasoning_summary" | "why_selected" | "why_not" | "alternative_profiles" | "matched" | "rejected" | "confidence" | "matched_attributes">;
export type MakaronQueryResult = AdaptedQueryBase & {
    adapter: "makaron";
    seed_audio: {
        music_prompt: string;
        sound_effect_prompt?: string;
        producer_notes?: string;
        arrangement_notes: string;
        negative_prompt?: string;
    };
};
export type VideoEditorQueryResult = AdaptedQueryBase & {
    adapter: "video_editor";
    music_cue: {
        prompt: string;
        duration_seconds: number;
        role: MusicPrimaryRole;
        structure: string[];
        edit_points: string[];
        loopability: Loopability;
        arrangement_notes: string;
    };
};
export type ShortVideoAgentQueryResult = AdaptedQueryBase & {
    adapter: "short_video_agent";
    short_video_music: {
        hook_prompt: string;
        duration_seconds: number;
        energy_level: EnergyLevel;
        music_role: MusicPrimaryRole;
        beat_sync_notes: string[];
        loopability: Loopability;
        arrangement_notes: string;
        negative_prompt?: string;
    };
};
export type AdaptedQueryResult = QueryResult | MakaronQueryResult | VideoEditorQueryResult | ShortVideoAgentQueryResult;
export type SearchResult = {
    profile: MusicProfile;
    score: number;
    reason: string;
};
export type SeedAudioPromptResult = {
    status: "ok";
    profile_id: string;
    generation_prompt: GenerationPrompt;
    music_prompt: string;
    sound_effect_prompt?: string;
    negative_prompt?: string;
    producer_notes?: string;
    arrangement_notes?: string;
};
export type MakaronPromptResult = {
    status: "ok";
    profile_id: string;
    agent: "makaron";
    makaron_prompt: string;
};
export declare class NoMatchingProfileError extends Error {
    readonly code = "NO_MATCHING_PROFILE";
    constructor(message?: string);
}
export {};
