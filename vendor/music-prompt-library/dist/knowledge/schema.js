import { z } from "zod";
import { musicProfileSchema } from "../schema.js";
const taxonomyDimensionSchema = z.object({
    description: z.string().min(1),
    canonical: z.array(z.string().min(1)).min(1),
    aliases: z.record(z.string().min(1))
});
export const taxonomyDimensionIds = [
    "genre",
    "mood",
    "application_domain",
    "usage_context",
    "music_role",
    "audio_density",
    "audio_brightness",
    "audio_warmth",
    "audio_punch",
    "audio_space",
    "audio_polish"
];
export const musicTaxonomySchema = z.object({
    schema_version: z.literal("1.1"),
    families: z.array(z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        target_profile_count: z.number().int().positive()
    })).min(1),
    dimensions: z.object(Object.fromEntries(taxonomyDimensionIds.map((id) => [id, taxonomyDimensionSchema])))
});
const similarProfileSchema = z.object({
    profile_id: z.string().min(1),
    weight: z.number().min(0).max(1),
    reason: z.string().min(1),
    shared_attributes: z.array(z.string().min(1)).min(1).optional(),
    differences: z.array(z.string().min(1)).min(1).optional()
});
const fallbackProfileSchema = z.object({
    profile_id: z.string().min(1),
    priority: z.number().int().positive(),
    conditions: z
        .array(z.enum(["low_confidence", "constraint_conflict", "profile_unavailable", "profile_deprecated"]))
        .min(1),
    reason: z.string().min(1)
});
export const profileRelationshipSchema = z.object({
    profile_id: z.string().min(1),
    family_id: z.string().min(1),
    parent_profile_id: z.string().min(1).optional(),
    similar_profiles: z.array(similarProfileSchema),
    fallback_profiles: z.array(fallbackProfileSchema)
});
export const profileRelationshipRegistrySchema = z.object({
    schema_version: z.literal("1.1"),
    relationships: z.array(profileRelationshipSchema)
});
const differentiatorsSchema = z.object({
    music_identity: z.array(z.string().min(1)),
    audio_character: z.array(z.string().min(1)),
    music_role: z.array(z.string().min(1)),
    application_fit: z.array(z.string().min(1)),
    arrangement_direction: z.array(z.string().min(1))
});
const candidateBenchmarkSchema = z.object({
    id: z.string().min(1),
    category: z.enum(["zh_short", "en_short", "long_description", "contrast_negative"]),
    request: z.string().min(1),
    duration: z.number().int().positive().optional(),
    expected_profile_id: z.string().min(1)
});
const profileCandidateSchema = z.object({
    profile: musicProfileSchema,
    family_id: z.string().min(1),
    nearest_existing_profiles: z.array(z.string().min(1)).min(1),
    differentiators: differentiatorsSchema,
    staged_relationship: profileRelationshipSchema,
    benchmark_cases: z.array(candidateBenchmarkSchema).min(6)
}).superRefine((candidate, context) => {
    if (candidate.profile.metadata.status !== "draft") {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Candidate Profile must have draft status.", path: ["profile", "metadata", "status"] });
    }
    if (candidate.profile.metadata.id !== candidate.staged_relationship.profile_id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Candidate and relationship Profile IDs must match.", path: ["staged_relationship", "profile_id"] });
    }
    if (candidate.family_id !== candidate.staged_relationship.family_id) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Candidate and relationship Family IDs must match.", path: ["staged_relationship", "family_id"] });
    }
    if (candidate.benchmark_cases.some((item) => item.expected_profile_id !== candidate.profile.metadata.id)) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Candidate benchmark expected IDs must match the candidate.", path: ["benchmark_cases"] });
    }
});
export const profileCandidateBatchSchema = z.object({
    schema_version: z.literal("1.0"),
    batch_id: z.string().min(1),
    candidates: z.array(profileCandidateSchema).min(1)
});
export const profileChangelogSchema = z.object({
    schema_version: z.literal("1.0"),
    entries: z.array(z.object({
        profile_id: z.string().min(1),
        action: z.enum(["created", "merged", "deprecated", "renamed"]),
        version: z.string().regex(/^\d+\.\d+\.\d+$/),
        reason: z.string().min(1),
        related_profiles: z.array(z.string().min(1)),
        previous_profile_id: z.string().min(1).optional(),
        timestamp: z.string().datetime().optional()
    }))
});
