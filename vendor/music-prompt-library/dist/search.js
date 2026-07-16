import { loadProfiles } from "./profileStore.js";
const MAX_SCORE = 148;
function normalize(value) {
    return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
function matchesValue(values, query) {
    if (!values)
        return false;
    const expected = normalize(query);
    return values.some((value) => {
        const candidate = normalize(value);
        return candidate === expected || candidate.includes(expected) || expected.includes(candidate);
    });
}
function searchableProfileTags(profile) {
    return [
        profile.metadata.id,
        ...(profile.metadata.legacy_ids ?? []),
        ...(profile.metadata.aliases ?? []),
        ...profile.metadata.semantic_keywords,
        ...(profile.metadata.tags ?? []),
        ...profile.music_identity.genre,
        ...(profile.music_identity.sub_genre ?? []),
        ...profile.music_identity.mood,
        ...profile.application_fit.domains,
        ...profile.application_fit.usage_context,
        ...(profile.application_fit.content_types ?? []),
        ...(profile.application_fit.audience_context ?? []),
        ...(profile.application_fit.pacing_fit ?? []),
        profile.music_role.primary_role,
        ...(profile.music_role.secondary_roles ?? []),
        ...(profile.music_role.narrative_function ?? []),
        ...(profile.music_role.edit_function ?? []),
        ...(profile.music_role.emotional_function ?? [])
    ];
}
function sceneTags(profile) {
    return [
        profile.metadata.id,
        ...(profile.metadata.legacy_ids ?? []),
        ...(profile.metadata.aliases ?? []),
        ...profile.metadata.semantic_keywords,
        ...(profile.metadata.tags ?? []),
        ...profile.application_fit.domains,
        ...(profile.application_fit.content_types ?? [])
    ];
}
function semanticScore(profile, query) {
    if (!query)
        return 0;
    const normalizedQuery = normalize(query);
    const keywordMatches = profile.metadata.semantic_keywords.filter((tag) => {
        const normalizedTag = normalize(tag);
        return normalizedTag.length >= 2 && normalizedQuery.includes(normalizedTag);
    });
    const broadMatches = searchableProfileTags(profile).filter((tag) => {
        const normalizedTag = normalize(tag);
        return normalizedTag.length >= 2 && normalizedQuery.includes(normalizedTag);
    });
    return Math.min(42, new Set(keywordMatches.map(normalize)).size * 7 + new Set(broadMatches.map(normalize)).size * 2);
}
function requestedScene(input) {
    return input.contentScene ?? input.scene;
}
function requestedEnergy(input) {
    return input.energyLevel ?? input.energy;
}
function roleValues(profile) {
    return [profile.music_role.primary_role, ...(profile.music_role.secondary_roles ?? [])];
}
function buildReason(profile, input) {
    const parts = [];
    const scene = requestedScene(input);
    const energy = requestedEnergy(input);
    if (scene && matchesValue(sceneTags(profile), scene))
        parts.push(`${scene} application`);
    if (input.usage && matchesValue(profile.application_fit.usage_context, input.usage))
        parts.push(`${input.usage} usage`);
    if (input.musicRole && matchesValue(roleValues(profile), input.musicRole))
        parts.push(`${input.musicRole} role`);
    if (input.mood && matchesValue(profile.music_identity.mood, input.mood))
        parts.push(`${input.mood} mood`);
    if (typeof energy === "number")
        parts.push(`energy ${profile.music_identity.energy_level}/5`);
    if (input.vocalType && profile.music_identity.vocal_type === input.vocalType)
        parts.push(`${input.vocalType}`);
    if (input.duration && profile.application_fit.recommended_duration_seconds.includes(input.duration))
        parts.push(`${input.duration}s`);
    if (input.semanticQuery && semanticScore(profile, input.semanticQuery) > 0)
        parts.push("semantic keywords");
    return parts.length > 0 ? `Matches ${parts.join(", ")}.` : "Related profile based on library ranking.";
}
export function scoreProfile(profile, input) {
    let rawScore = semanticScore(profile, input.semanticQuery);
    const scene = requestedScene(input);
    const energy = requestedEnergy(input);
    const sceneMatched = scene ? matchesValue(sceneTags(profile), scene) : false;
    if (scene && !sceneMatched && !input.semanticQuery)
        return null;
    if (sceneMatched && scene) {
        rawScore += 30;
        if (matchesValue(profile.application_fit.domains, scene))
            rawScore += 10;
    }
    if (input.usage && matchesValue(profile.application_fit.usage_context, input.usage))
        rawScore += 15;
    if (input.musicRole && matchesValue(roleValues(profile), input.musicRole)) {
        rawScore += 20;
        if (profile.music_role.primary_role === input.musicRole)
            rawScore += 10;
    }
    if (input.mood && matchesValue(profile.music_identity.mood, input.mood))
        rawScore += 15;
    if (typeof energy === "number")
        rawScore += Math.max(0, 10 - Math.abs(profile.music_identity.energy_level - energy) * 2);
    if (input.vocalType && profile.music_identity.vocal_type === input.vocalType)
        rawScore += 5;
    if (input.duration && profile.application_fit.recommended_duration_seconds.includes(input.duration))
        rawScore += 6;
    if (rawScore <= 0)
        return null;
    return {
        profile,
        score: Number((Math.min(rawScore, MAX_SCORE) / MAX_SCORE).toFixed(2)),
        reason: buildReason(profile, input)
    };
}
export async function searchProfiles(input) {
    const limit = input.limit ?? 5;
    const profiles = await loadProfiles();
    return profiles
        .map((profile) => scoreProfile(profile, input))
        .filter((result) => result !== null)
        .sort((a, b) => b.score - a.score || a.profile.metadata.id.localeCompare(b.profile.metadata.id))
        .slice(0, limit);
}
