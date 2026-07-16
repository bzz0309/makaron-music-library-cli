import { z } from "zod";
export declare const taxonomyDimensionIds: readonly ["genre", "mood", "application_domain", "usage_context", "music_role", "audio_density", "audio_brightness", "audio_warmth", "audio_punch", "audio_space", "audio_polish"];
export declare const musicTaxonomySchema: z.ZodObject<{
    schema_version: z.ZodLiteral<"1.1">;
    families: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        target_profile_count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        description: string;
        target_profile_count: number;
    }, {
        id: string;
        title: string;
        description: string;
        target_profile_count: number;
    }>, "many">;
    dimensions: z.ZodObject<Record<"music_role" | "usage_context" | "mood" | "genre" | "application_domain" | "audio_density" | "audio_brightness" | "audio_warmth" | "audio_punch" | "audio_space" | "audio_polish", z.ZodObject<{
        description: z.ZodString;
        canonical: z.ZodArray<z.ZodString, "many">;
        aliases: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        aliases: Record<string, string>;
        canonical: string[];
    }, {
        description: string;
        aliases: Record<string, string>;
        canonical: string[];
    }>>, "strip", z.ZodTypeAny, {
        music_role: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        usage_context: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        mood: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        genre: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        application_domain: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_density: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_brightness: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_warmth: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_punch: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_space: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_polish: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
    }, {
        music_role: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        usage_context: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        mood: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        genre: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        application_domain: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_density: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_brightness: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_warmth: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_punch: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_space: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_polish: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
    }>;
}, "strip", z.ZodTypeAny, {
    schema_version: "1.1";
    families: {
        id: string;
        title: string;
        description: string;
        target_profile_count: number;
    }[];
    dimensions: {
        music_role: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        usage_context: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        mood: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        genre: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        application_domain: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_density: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_brightness: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_warmth: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_punch: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_space: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_polish: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
    };
}, {
    schema_version: "1.1";
    families: {
        id: string;
        title: string;
        description: string;
        target_profile_count: number;
    }[];
    dimensions: {
        music_role: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        usage_context: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        mood: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        genre: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        application_domain: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_density: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_brightness: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_warmth: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_punch: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_space: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
        audio_polish: {
            description: string;
            aliases: Record<string, string>;
            canonical: string[];
        };
    };
}>;
export declare const profileRelationshipSchema: z.ZodObject<{
    profile_id: z.ZodString;
    family_id: z.ZodString;
    parent_profile_id: z.ZodOptional<z.ZodString>;
    similar_profiles: z.ZodArray<z.ZodObject<{
        profile_id: z.ZodString;
        weight: z.ZodNumber;
        reason: z.ZodString;
        shared_attributes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        differences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        profile_id: string;
        reason: string;
        weight: number;
        shared_attributes?: string[] | undefined;
        differences?: string[] | undefined;
    }, {
        profile_id: string;
        reason: string;
        weight: number;
        shared_attributes?: string[] | undefined;
        differences?: string[] | undefined;
    }>, "many">;
    fallback_profiles: z.ZodArray<z.ZodObject<{
        profile_id: z.ZodString;
        priority: z.ZodNumber;
        conditions: z.ZodArray<z.ZodEnum<["low_confidence", "constraint_conflict", "profile_unavailable", "profile_deprecated"]>, "many">;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        profile_id: string;
        reason: string;
        priority: number;
        conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
    }, {
        profile_id: string;
        reason: string;
        priority: number;
        conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    profile_id: string;
    family_id: string;
    similar_profiles: {
        profile_id: string;
        reason: string;
        weight: number;
        shared_attributes?: string[] | undefined;
        differences?: string[] | undefined;
    }[];
    fallback_profiles: {
        profile_id: string;
        reason: string;
        priority: number;
        conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
    }[];
    parent_profile_id?: string | undefined;
}, {
    profile_id: string;
    family_id: string;
    similar_profiles: {
        profile_id: string;
        reason: string;
        weight: number;
        shared_attributes?: string[] | undefined;
        differences?: string[] | undefined;
    }[];
    fallback_profiles: {
        profile_id: string;
        reason: string;
        priority: number;
        conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
    }[];
    parent_profile_id?: string | undefined;
}>;
export declare const profileRelationshipRegistrySchema: z.ZodObject<{
    schema_version: z.ZodLiteral<"1.1">;
    relationships: z.ZodArray<z.ZodObject<{
        profile_id: z.ZodString;
        family_id: z.ZodString;
        parent_profile_id: z.ZodOptional<z.ZodString>;
        similar_profiles: z.ZodArray<z.ZodObject<{
            profile_id: z.ZodString;
            weight: z.ZodNumber;
            reason: z.ZodString;
            shared_attributes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            differences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            profile_id: string;
            reason: string;
            weight: number;
            shared_attributes?: string[] | undefined;
            differences?: string[] | undefined;
        }, {
            profile_id: string;
            reason: string;
            weight: number;
            shared_attributes?: string[] | undefined;
            differences?: string[] | undefined;
        }>, "many">;
        fallback_profiles: z.ZodArray<z.ZodObject<{
            profile_id: z.ZodString;
            priority: z.ZodNumber;
            conditions: z.ZodArray<z.ZodEnum<["low_confidence", "constraint_conflict", "profile_unavailable", "profile_deprecated"]>, "many">;
            reason: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            profile_id: string;
            reason: string;
            priority: number;
            conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
        }, {
            profile_id: string;
            reason: string;
            priority: number;
            conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        profile_id: string;
        family_id: string;
        similar_profiles: {
            profile_id: string;
            reason: string;
            weight: number;
            shared_attributes?: string[] | undefined;
            differences?: string[] | undefined;
        }[];
        fallback_profiles: {
            profile_id: string;
            reason: string;
            priority: number;
            conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
        }[];
        parent_profile_id?: string | undefined;
    }, {
        profile_id: string;
        family_id: string;
        similar_profiles: {
            profile_id: string;
            reason: string;
            weight: number;
            shared_attributes?: string[] | undefined;
            differences?: string[] | undefined;
        }[];
        fallback_profiles: {
            profile_id: string;
            reason: string;
            priority: number;
            conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
        }[];
        parent_profile_id?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    relationships: {
        profile_id: string;
        family_id: string;
        similar_profiles: {
            profile_id: string;
            reason: string;
            weight: number;
            shared_attributes?: string[] | undefined;
            differences?: string[] | undefined;
        }[];
        fallback_profiles: {
            profile_id: string;
            reason: string;
            priority: number;
            conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
        }[];
        parent_profile_id?: string | undefined;
    }[];
    schema_version: "1.1";
}, {
    relationships: {
        profile_id: string;
        family_id: string;
        similar_profiles: {
            profile_id: string;
            reason: string;
            weight: number;
            shared_attributes?: string[] | undefined;
            differences?: string[] | undefined;
        }[];
        fallback_profiles: {
            profile_id: string;
            reason: string;
            priority: number;
            conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
        }[];
        parent_profile_id?: string | undefined;
    }[];
    schema_version: "1.1";
}>;
export declare const profileCandidateBatchSchema: z.ZodObject<{
    schema_version: z.ZodLiteral<"1.0">;
    batch_id: z.ZodString;
    candidates: z.ZodArray<z.ZodEffects<z.ZodObject<{
        profile: z.ZodObject<{
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
        family_id: z.ZodString;
        nearest_existing_profiles: z.ZodArray<z.ZodString, "many">;
        differentiators: z.ZodObject<{
            music_identity: z.ZodArray<z.ZodString, "many">;
            audio_character: z.ZodArray<z.ZodString, "many">;
            music_role: z.ZodArray<z.ZodString, "many">;
            application_fit: z.ZodArray<z.ZodString, "many">;
            arrangement_direction: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        }, {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        }>;
        staged_relationship: z.ZodObject<{
            profile_id: z.ZodString;
            family_id: z.ZodString;
            parent_profile_id: z.ZodOptional<z.ZodString>;
            similar_profiles: z.ZodArray<z.ZodObject<{
                profile_id: z.ZodString;
                weight: z.ZodNumber;
                reason: z.ZodString;
                shared_attributes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                differences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            }, "strip", z.ZodTypeAny, {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }, {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }>, "many">;
            fallback_profiles: z.ZodArray<z.ZodObject<{
                profile_id: z.ZodString;
                priority: z.ZodNumber;
                conditions: z.ZodArray<z.ZodEnum<["low_confidence", "constraint_conflict", "profile_unavailable", "profile_deprecated"]>, "many">;
                reason: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }, {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        }, {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        }>;
        benchmark_cases: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            category: z.ZodEnum<["zh_short", "en_short", "long_description", "contrast_negative"]>;
            request: z.ZodString;
            duration: z.ZodOptional<z.ZodNumber>;
            expected_profile_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }, {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        profile: {
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
        };
        differentiators: {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        };
        family_id: string;
        nearest_existing_profiles: string[];
        staged_relationship: {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        };
        benchmark_cases: {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }[];
    }, {
        profile: {
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
        };
        differentiators: {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        };
        family_id: string;
        nearest_existing_profiles: string[];
        staged_relationship: {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        };
        benchmark_cases: {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }[];
    }>, {
        profile: {
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
        };
        differentiators: {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        };
        family_id: string;
        nearest_existing_profiles: string[];
        staged_relationship: {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        };
        benchmark_cases: {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }[];
    }, {
        profile: {
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
        };
        differentiators: {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        };
        family_id: string;
        nearest_existing_profiles: string[];
        staged_relationship: {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        };
        benchmark_cases: {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    schema_version: "1.0";
    batch_id: string;
    candidates: {
        profile: {
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
        };
        differentiators: {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        };
        family_id: string;
        nearest_existing_profiles: string[];
        staged_relationship: {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        };
        benchmark_cases: {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }[];
    }[];
}, {
    schema_version: "1.0";
    batch_id: string;
    candidates: {
        profile: {
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
        };
        differentiators: {
            music_role: string[];
            application_fit: string[];
            audio_character: string[];
            music_identity: string[];
            arrangement_direction: string[];
        };
        family_id: string;
        nearest_existing_profiles: string[];
        staged_relationship: {
            profile_id: string;
            family_id: string;
            similar_profiles: {
                profile_id: string;
                reason: string;
                weight: number;
                shared_attributes?: string[] | undefined;
                differences?: string[] | undefined;
            }[];
            fallback_profiles: {
                profile_id: string;
                reason: string;
                priority: number;
                conditions: ("low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated")[];
            }[];
            parent_profile_id?: string | undefined;
        };
        benchmark_cases: {
            id: string;
            request: string;
            category: "zh_short" | "en_short" | "long_description" | "contrast_negative";
            expected_profile_id: string;
            duration?: number | undefined;
        }[];
    }[];
}>;
export declare const profileChangelogSchema: z.ZodObject<{
    schema_version: z.ZodLiteral<"1.0">;
    entries: z.ZodArray<z.ZodObject<{
        profile_id: z.ZodString;
        action: z.ZodEnum<["created", "merged", "deprecated", "renamed"]>;
        version: z.ZodString;
        reason: z.ZodString;
        related_profiles: z.ZodArray<z.ZodString, "many">;
        previous_profile_id: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        profile_id: string;
        reason: string;
        version: string;
        action: "deprecated" | "created" | "merged" | "renamed";
        related_profiles: string[];
        previous_profile_id?: string | undefined;
        timestamp?: string | undefined;
    }, {
        profile_id: string;
        reason: string;
        version: string;
        action: "deprecated" | "created" | "merged" | "renamed";
        related_profiles: string[];
        previous_profile_id?: string | undefined;
        timestamp?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    entries: {
        profile_id: string;
        reason: string;
        version: string;
        action: "deprecated" | "created" | "merged" | "renamed";
        related_profiles: string[];
        previous_profile_id?: string | undefined;
        timestamp?: string | undefined;
    }[];
    schema_version: "1.0";
}, {
    entries: {
        profile_id: string;
        reason: string;
        version: string;
        action: "deprecated" | "created" | "merged" | "renamed";
        related_profiles: string[];
        previous_profile_id?: string | undefined;
        timestamp?: string | undefined;
    }[];
    schema_version: "1.0";
}>;
