import { z } from "zod";
const vocalTypeSchema = z.enum(["vocal", "instrumental", "mixed", "none", "unknown"]);
const energyLevelSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const profileStatusSchema = z.enum(["active", "draft", "deprecated"]);
const tempoFeelSchema = z.enum(["slow", "medium", "fast", "fast_paced", "variable"]);
const loopabilitySchema = z.enum(["low", "medium", "high"]);
const intensityCurveSchema = z.enum(["flat", "build_up", "drop", "rise_and_fall", "stinger"]);
const musicPrimaryRoleSchema = z.enum([
    "intro",
    "background",
    "transition",
    "emotional_support",
    "rhythmic_driver",
    "tension_builder",
    "climax_support",
    "ending",
    "brand_signature"
]);
export const queryAdapterSchema = z.enum(["generic", "makaron", "video_editor", "short_video_agent"]);
export const generationPromptSchema = z.object({
    music_prompt: z.string().min(1),
    sound_effect_prompt: z.string().optional(),
    negative_prompt: z.string().optional(),
    producer_notes: z.string().optional(),
    arrangement_notes: z.string().optional()
});
export const musicProfileSchema = z.object({
    metadata: z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        version: z.literal("1.2"),
        status: profileStatusSchema,
        legacy_ids: z.array(z.string().min(1)).optional(),
        aliases: z.array(z.string().min(1)).optional(),
        semantic_keywords: z.array(z.string().min(1)).min(8),
        tags: z.array(z.string().min(1)).optional()
    }),
    music_identity: z.object({
        genre: z.array(z.string().min(1)).min(1),
        sub_genre: z.array(z.string().min(1)).optional(),
        mood: z.array(z.string().min(1)).min(1),
        energy_level: energyLevelSchema,
        bpm: z.number().int().positive().optional(),
        bpm_range: z.tuple([z.number().int().positive(), z.number().int().positive()]).optional(),
        tempo_feel: tempoFeelSchema.optional(),
        rhythm: z.array(z.string().min(1)).optional(),
        instrumentation: z.array(z.string().min(1)).optional(),
        vocal_type: vocalTypeSchema,
        language: z.array(z.string().min(1)).optional(),
        structure: z.array(z.string().min(1)).optional(),
        loopability: loopabilitySchema.optional(),
        intensity_curve: intensityCurveSchema.optional()
    }),
    audio_character: z.object({
        texture: z.array(z.string().min(1)).optional(),
        timbre: z.array(z.string().min(1)).optional(),
        density: z.enum(["sparse", "medium", "dense"]).optional(),
        brightness: z.enum(["dark", "neutral", "bright"]).optional(),
        warmth: z.enum(["cold", "neutral", "warm"]).optional(),
        punch: z.enum(["soft", "medium", "hard"]).optional(),
        space: z.enum(["dry", "roomy", "wide", "cinematic"]).optional(),
        polish: z.enum(["raw", "clean", "premium"]).optional()
    }),
    music_role: z.object({
        primary_role: musicPrimaryRoleSchema,
        secondary_roles: z.array(musicPrimaryRoleSchema).optional(),
        narrative_function: z.array(z.string().min(1)).optional(),
        edit_function: z.array(z.string().min(1)).optional(),
        emotional_function: z.array(z.string().min(1)).optional()
    }),
    application_fit: z.object({
        domains: z.array(z.string().min(1)).min(1),
        usage_context: z.array(z.string().min(1)).min(1),
        content_types: z.array(z.string().min(1)).optional(),
        audience_context: z.array(z.string().min(1)).optional(),
        platform_context: z.array(z.string().min(1)).optional(),
        recommended_duration_seconds: z.array(z.number().int().positive()).min(1),
        pacing_fit: z.array(z.string().min(1)).optional(),
        visual_energy_fit: z.array(z.string().min(1)).optional()
    }),
    generation_prompt: generationPromptSchema
});
export const musicProfilesSchema = z.array(musicProfileSchema);
const stringOrStringsSchema = z.union([z.string().trim().min(1), z.array(z.string().trim().min(1)).min(1)]);
export const workflowContextSchema = z.object({
    content_type: stringOrStringsSchema.optional(),
    duration: z.number().int().positive().optional(),
    style: stringOrStringsSchema.optional(),
    target: stringOrStringsSchema.optional(),
    platform: stringOrStringsSchema.optional()
}).strict();
export const conversationTurnSchema = z.object({
    request: z.string().trim().min(1),
    workflow_context: workflowContextSchema.optional()
}).strict();
const singleRequestSchema = z.object({
    request: z.string().trim().min(1),
    duration: z.number().int().positive().optional(),
    workflow_context: workflowContextSchema.optional()
}).strict();
const multiTurnRequestSchema = z.object({
    turns: z.array(conversationTurnSchema).min(1).max(20),
    duration: z.number().int().positive().optional(),
    workflow_context: workflowContextSchema.optional()
}).strict();
export const queryInputSchema = z.union([singleRequestSchema, multiTurnRequestSchema]);
export const agentAdapterProfileSchema = z.object({
    profile_id: z.string().min(1),
    adapters: z.object({
        makaron: z
            .object({
            type: z.literal("seed_audio_prompt"),
            output_format: z.literal("makaron_prompt"),
            prompt_strategy: z.string().optional()
        })
            .optional(),
        video_editor: z
            .object({
            type: z.enum(["background_music_prompt", "transition_music_prompt", "music_brief"]),
            prompt_strategy: z.string().optional()
        })
            .optional(),
        short_video_agent: z
            .object({
            type: z.enum(["intro_music_prompt", "background_music_prompt", "climax_music_prompt"]),
            prompt_strategy: z.string().optional()
        })
            .optional(),
        generic: z
            .object({
            type: z.literal("music_generation_brief")
        })
            .optional()
    })
});
export const agentAdapterProfilesSchema = z.array(agentAdapterProfileSchema);
