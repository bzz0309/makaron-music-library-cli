import { z } from "zod";
export declare const queryAdapterSchema: z.ZodEnum<["generic", "makaron", "video_editor", "short_video_agent"]>;
export declare const generationPromptSchema: z.ZodObject<{
    music_prompt: z.ZodString;
    sound_effect_prompt: z.ZodOptional<z.ZodString>;
    negative_prompt: z.ZodOptional<z.ZodString>;
    producer_notes: z.ZodOptional<z.ZodString>;
    arrangement_notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    music_prompt: string;
    arrangement_notes?: string | undefined;
    sound_effect_prompt?: string | undefined;
    negative_prompt?: string | undefined;
    producer_notes?: string | undefined;
}, {
    music_prompt: string;
    arrangement_notes?: string | undefined;
    sound_effect_prompt?: string | undefined;
    negative_prompt?: string | undefined;
    producer_notes?: string | undefined;
}>;
export declare const musicProfileSchema: z.ZodObject<{
    metadata: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodLiteral<"1.2">;
        status: z.ZodEnum<["active", "draft", "deprecated"]>;
        legacy_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        aliases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        semantic_keywords: z.ZodArray<z.ZodString, "many">;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    }, {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    }>;
    music_identity: z.ZodObject<{
        genre: z.ZodArray<z.ZodString, "many">;
        sub_genre: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mood: z.ZodArray<z.ZodString, "many">;
        energy_level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>]>;
        bpm: z.ZodOptional<z.ZodNumber>;
        bpm_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        tempo_feel: z.ZodOptional<z.ZodEnum<["slow", "medium", "fast", "fast_paced", "variable"]>>;
        rhythm: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        instrumentation: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        vocal_type: z.ZodEnum<["vocal", "instrumental", "mixed", "none", "unknown"]>;
        language: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        structure: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        loopability: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        intensity_curve: z.ZodOptional<z.ZodEnum<["flat", "build_up", "drop", "rise_and_fall", "stinger"]>>;
    }, "strip", z.ZodTypeAny, {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    }, {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    }>;
    audio_character: z.ZodObject<{
        texture: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        timbre: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        density: z.ZodOptional<z.ZodEnum<["sparse", "medium", "dense"]>>;
        brightness: z.ZodOptional<z.ZodEnum<["dark", "neutral", "bright"]>>;
        warmth: z.ZodOptional<z.ZodEnum<["cold", "neutral", "warm"]>>;
        punch: z.ZodOptional<z.ZodEnum<["soft", "medium", "hard"]>>;
        space: z.ZodOptional<z.ZodEnum<["dry", "roomy", "wide", "cinematic"]>>;
        polish: z.ZodOptional<z.ZodEnum<["raw", "clean", "premium"]>>;
    }, "strip", z.ZodTypeAny, {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    }, {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    }>;
    music_role: z.ZodObject<{
        primary_role: z.ZodEnum<["intro", "background", "transition", "emotional_support", "rhythmic_driver", "tension_builder", "climax_support", "ending", "brand_signature"]>;
        secondary_roles: z.ZodOptional<z.ZodArray<z.ZodEnum<["intro", "background", "transition", "emotional_support", "rhythmic_driver", "tension_builder", "climax_support", "ending", "brand_signature"]>, "many">>;
        narrative_function: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        edit_function: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        emotional_function: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    }, {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    }>;
    application_fit: z.ZodObject<{
        domains: z.ZodArray<z.ZodString, "many">;
        usage_context: z.ZodArray<z.ZodString, "many">;
        content_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        audience_context: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        platform_context: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        recommended_duration_seconds: z.ZodArray<z.ZodNumber, "many">;
        pacing_fit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        visual_energy_fit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    }, {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    }>;
    generation_prompt: z.ZodObject<{
        music_prompt: z.ZodString;
        sound_effect_prompt: z.ZodOptional<z.ZodString>;
        negative_prompt: z.ZodOptional<z.ZodString>;
        producer_notes: z.ZodOptional<z.ZodString>;
        arrangement_notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    }, {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    music_role: {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    };
    application_fit: {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    };
    audio_character: {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    };
    metadata: {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    };
    music_identity: {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    };
    generation_prompt: {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    };
}, {
    music_role: {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    };
    application_fit: {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    };
    audio_character: {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    };
    metadata: {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    };
    music_identity: {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    };
    generation_prompt: {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    };
}>;
export declare const musicProfilesSchema: z.ZodArray<z.ZodObject<{
    metadata: z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodLiteral<"1.2">;
        status: z.ZodEnum<["active", "draft", "deprecated"]>;
        legacy_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        aliases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        semantic_keywords: z.ZodArray<z.ZodString, "many">;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    }, {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    }>;
    music_identity: z.ZodObject<{
        genre: z.ZodArray<z.ZodString, "many">;
        sub_genre: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mood: z.ZodArray<z.ZodString, "many">;
        energy_level: z.ZodUnion<[z.ZodLiteral<1>, z.ZodLiteral<2>, z.ZodLiteral<3>, z.ZodLiteral<4>, z.ZodLiteral<5>]>;
        bpm: z.ZodOptional<z.ZodNumber>;
        bpm_range: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        tempo_feel: z.ZodOptional<z.ZodEnum<["slow", "medium", "fast", "fast_paced", "variable"]>>;
        rhythm: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        instrumentation: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        vocal_type: z.ZodEnum<["vocal", "instrumental", "mixed", "none", "unknown"]>;
        language: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        structure: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        loopability: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        intensity_curve: z.ZodOptional<z.ZodEnum<["flat", "build_up", "drop", "rise_and_fall", "stinger"]>>;
    }, "strip", z.ZodTypeAny, {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    }, {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    }>;
    audio_character: z.ZodObject<{
        texture: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        timbre: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        density: z.ZodOptional<z.ZodEnum<["sparse", "medium", "dense"]>>;
        brightness: z.ZodOptional<z.ZodEnum<["dark", "neutral", "bright"]>>;
        warmth: z.ZodOptional<z.ZodEnum<["cold", "neutral", "warm"]>>;
        punch: z.ZodOptional<z.ZodEnum<["soft", "medium", "hard"]>>;
        space: z.ZodOptional<z.ZodEnum<["dry", "roomy", "wide", "cinematic"]>>;
        polish: z.ZodOptional<z.ZodEnum<["raw", "clean", "premium"]>>;
    }, "strip", z.ZodTypeAny, {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    }, {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    }>;
    music_role: z.ZodObject<{
        primary_role: z.ZodEnum<["intro", "background", "transition", "emotional_support", "rhythmic_driver", "tension_builder", "climax_support", "ending", "brand_signature"]>;
        secondary_roles: z.ZodOptional<z.ZodArray<z.ZodEnum<["intro", "background", "transition", "emotional_support", "rhythmic_driver", "tension_builder", "climax_support", "ending", "brand_signature"]>, "many">>;
        narrative_function: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        edit_function: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        emotional_function: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    }, {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    }>;
    application_fit: z.ZodObject<{
        domains: z.ZodArray<z.ZodString, "many">;
        usage_context: z.ZodArray<z.ZodString, "many">;
        content_types: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        audience_context: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        platform_context: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        recommended_duration_seconds: z.ZodArray<z.ZodNumber, "many">;
        pacing_fit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        visual_energy_fit: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    }, {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    }>;
    generation_prompt: z.ZodObject<{
        music_prompt: z.ZodString;
        sound_effect_prompt: z.ZodOptional<z.ZodString>;
        negative_prompt: z.ZodOptional<z.ZodString>;
        producer_notes: z.ZodOptional<z.ZodString>;
        arrangement_notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    }, {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    music_role: {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    };
    application_fit: {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    };
    audio_character: {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    };
    metadata: {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    };
    music_identity: {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    };
    generation_prompt: {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    };
}, {
    music_role: {
        primary_role: "intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature";
        secondary_roles?: ("intro" | "background" | "transition" | "emotional_support" | "rhythmic_driver" | "tension_builder" | "climax_support" | "ending" | "brand_signature")[] | undefined;
        narrative_function?: string[] | undefined;
        edit_function?: string[] | undefined;
        emotional_function?: string[] | undefined;
    };
    application_fit: {
        usage_context: string[];
        domains: string[];
        recommended_duration_seconds: number[];
        content_types?: string[] | undefined;
        audience_context?: string[] | undefined;
        platform_context?: string[] | undefined;
        pacing_fit?: string[] | undefined;
        visual_energy_fit?: string[] | undefined;
    };
    audio_character: {
        texture?: string[] | undefined;
        timbre?: string[] | undefined;
        density?: "medium" | "sparse" | "dense" | undefined;
        brightness?: "dark" | "neutral" | "bright" | undefined;
        warmth?: "neutral" | "cold" | "warm" | undefined;
        punch?: "medium" | "soft" | "hard" | undefined;
        space?: "dry" | "roomy" | "wide" | "cinematic" | undefined;
        polish?: "raw" | "clean" | "premium" | undefined;
    };
    metadata: {
        semantic_keywords: string[];
        status: "active" | "draft" | "deprecated";
        id: string;
        title: string;
        version: "1.2";
        description?: string | undefined;
        legacy_ids?: string[] | undefined;
        aliases?: string[] | undefined;
        tags?: string[] | undefined;
    };
    music_identity: {
        mood: string[];
        energy_level: 1 | 2 | 3 | 4 | 5;
        genre: string[];
        vocal_type: "mixed" | "unknown" | "vocal" | "instrumental" | "none";
        sub_genre?: string[] | undefined;
        bpm?: number | undefined;
        bpm_range?: [number, number] | undefined;
        tempo_feel?: "slow" | "medium" | "fast" | "fast_paced" | "variable" | undefined;
        rhythm?: string[] | undefined;
        instrumentation?: string[] | undefined;
        language?: string[] | undefined;
        structure?: string[] | undefined;
        loopability?: "medium" | "low" | "high" | undefined;
        intensity_curve?: "flat" | "build_up" | "drop" | "rise_and_fall" | "stinger" | undefined;
    };
    generation_prompt: {
        music_prompt: string;
        arrangement_notes?: string | undefined;
        sound_effect_prompt?: string | undefined;
        negative_prompt?: string | undefined;
        producer_notes?: string | undefined;
    };
}>, "many">;
export declare const workflowContextSchema: z.ZodObject<{
    content_type: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    duration: z.ZodOptional<z.ZodNumber>;
    style: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    target: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    platform: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strict", z.ZodTypeAny, {
    duration?: number | undefined;
    content_type?: string | string[] | undefined;
    style?: string | string[] | undefined;
    target?: string | string[] | undefined;
    platform?: string | string[] | undefined;
}, {
    duration?: number | undefined;
    content_type?: string | string[] | undefined;
    style?: string | string[] | undefined;
    target?: string | string[] | undefined;
    platform?: string | string[] | undefined;
}>;
export declare const conversationTurnSchema: z.ZodObject<{
    request: z.ZodString;
    workflow_context: z.ZodOptional<z.ZodObject<{
        content_type: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        duration: z.ZodOptional<z.ZodNumber>;
        style: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        target: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        platform: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    }, "strict", z.ZodTypeAny, {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    }, {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    request: string;
    workflow_context?: {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    } | undefined;
}, {
    request: string;
    workflow_context?: {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    } | undefined;
}>;
export declare const queryInputSchema: z.ZodUnion<[z.ZodObject<{
    request: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    workflow_context: z.ZodOptional<z.ZodObject<{
        content_type: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        duration: z.ZodOptional<z.ZodNumber>;
        style: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        target: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        platform: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    }, "strict", z.ZodTypeAny, {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    }, {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    request: string;
    workflow_context?: {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    } | undefined;
    duration?: number | undefined;
}, {
    request: string;
    workflow_context?: {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    } | undefined;
    duration?: number | undefined;
}>, z.ZodObject<{
    turns: z.ZodArray<z.ZodObject<{
        request: z.ZodString;
        workflow_context: z.ZodOptional<z.ZodObject<{
            content_type: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
            duration: z.ZodOptional<z.ZodNumber>;
            style: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
            target: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
            platform: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        }, "strict", z.ZodTypeAny, {
            duration?: number | undefined;
            content_type?: string | string[] | undefined;
            style?: string | string[] | undefined;
            target?: string | string[] | undefined;
            platform?: string | string[] | undefined;
        }, {
            duration?: number | undefined;
            content_type?: string | string[] | undefined;
            style?: string | string[] | undefined;
            target?: string | string[] | undefined;
            platform?: string | string[] | undefined;
        }>>;
    }, "strict", z.ZodTypeAny, {
        request: string;
        workflow_context?: {
            duration?: number | undefined;
            content_type?: string | string[] | undefined;
            style?: string | string[] | undefined;
            target?: string | string[] | undefined;
            platform?: string | string[] | undefined;
        } | undefined;
    }, {
        request: string;
        workflow_context?: {
            duration?: number | undefined;
            content_type?: string | string[] | undefined;
            style?: string | string[] | undefined;
            target?: string | string[] | undefined;
            platform?: string | string[] | undefined;
        } | undefined;
    }>, "many">;
    duration: z.ZodOptional<z.ZodNumber>;
    workflow_context: z.ZodOptional<z.ZodObject<{
        content_type: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        duration: z.ZodOptional<z.ZodNumber>;
        style: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        target: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        platform: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    }, "strict", z.ZodTypeAny, {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    }, {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    turns: {
        request: string;
        workflow_context?: {
            duration?: number | undefined;
            content_type?: string | string[] | undefined;
            style?: string | string[] | undefined;
            target?: string | string[] | undefined;
            platform?: string | string[] | undefined;
        } | undefined;
    }[];
    workflow_context?: {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    } | undefined;
    duration?: number | undefined;
}, {
    turns: {
        request: string;
        workflow_context?: {
            duration?: number | undefined;
            content_type?: string | string[] | undefined;
            style?: string | string[] | undefined;
            target?: string | string[] | undefined;
            platform?: string | string[] | undefined;
        } | undefined;
    }[];
    workflow_context?: {
        duration?: number | undefined;
        content_type?: string | string[] | undefined;
        style?: string | string[] | undefined;
        target?: string | string[] | undefined;
        platform?: string | string[] | undefined;
    } | undefined;
    duration?: number | undefined;
}>]>;
export declare const agentAdapterProfileSchema: z.ZodObject<{
    profile_id: z.ZodString;
    adapters: z.ZodObject<{
        makaron: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"seed_audio_prompt">;
            output_format: z.ZodLiteral<"makaron_prompt">;
            prompt_strategy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        }, {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        }>>;
        video_editor: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["background_music_prompt", "transition_music_prompt", "music_brief"]>;
            prompt_strategy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        }, {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        }>>;
        short_video_agent: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["intro_music_prompt", "background_music_prompt", "climax_music_prompt"]>;
            prompt_strategy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        }, {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        }>>;
        generic: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"music_generation_brief">;
        }, "strip", z.ZodTypeAny, {
            type: "music_generation_brief";
        }, {
            type: "music_generation_brief";
        }>>;
    }, "strip", z.ZodTypeAny, {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    }, {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    profile_id: string;
    adapters: {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    };
}, {
    profile_id: string;
    adapters: {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    };
}>;
export declare const agentAdapterProfilesSchema: z.ZodArray<z.ZodObject<{
    profile_id: z.ZodString;
    adapters: z.ZodObject<{
        makaron: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"seed_audio_prompt">;
            output_format: z.ZodLiteral<"makaron_prompt">;
            prompt_strategy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        }, {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        }>>;
        video_editor: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["background_music_prompt", "transition_music_prompt", "music_brief"]>;
            prompt_strategy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        }, {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        }>>;
        short_video_agent: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<["intro_music_prompt", "background_music_prompt", "climax_music_prompt"]>;
            prompt_strategy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        }, {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        }>>;
        generic: z.ZodOptional<z.ZodObject<{
            type: z.ZodLiteral<"music_generation_brief">;
        }, "strip", z.ZodTypeAny, {
            type: "music_generation_brief";
        }, {
            type: "music_generation_brief";
        }>>;
    }, "strip", z.ZodTypeAny, {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    }, {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    profile_id: string;
    adapters: {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    };
}, {
    profile_id: string;
    adapters: {
        generic?: {
            type: "music_generation_brief";
        } | undefined;
        makaron?: {
            type: "seed_audio_prompt";
            output_format: "makaron_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
        video_editor?: {
            type: "background_music_prompt" | "transition_music_prompt" | "music_brief";
            prompt_strategy?: string | undefined;
        } | undefined;
        short_video_agent?: {
            type: "background_music_prompt" | "intro_music_prompt" | "climax_music_prompt";
            prompt_strategy?: string | undefined;
        } | undefined;
    };
}>, "many">;
