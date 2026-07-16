import { loadProfiles } from "../profileStore.js";
import { loadProfileRelationships } from "./store.js";
function normalize(value) {
    return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
function normalizedSet(values) {
    return new Set(values.filter((value) => Boolean(value)).map(normalize));
}
function intersection(left, right) {
    return [...left].filter((value) => right.has(value)).sort();
}
function difference(left, right) {
    return [...left].filter((value) => !right.has(value)).sort();
}
function jaccard(left, right) {
    if (left.size === 0 && right.size === 0)
        return 0;
    const shared = intersection(left, right).length;
    return shared / (left.size + right.size - shared);
}
function semantic(profile) {
    return normalizedSet(profile.metadata.semantic_keywords);
}
function application(profile) {
    return normalizedSet([
        ...profile.application_fit.domains,
        ...profile.application_fit.usage_context,
        ...(profile.application_fit.content_types ?? [])
    ]);
}
function roles(profile) {
    return normalizedSet([profile.music_role.primary_role, ...(profile.music_role.secondary_roles ?? [])]);
}
function identity(profile) {
    return normalizedSet([
        ...profile.music_identity.genre,
        ...(profile.music_identity.sub_genre ?? []),
        ...profile.music_identity.mood
    ]);
}
function audio(profile) {
    return normalizedSet([
        ...(profile.audio_character.texture ?? []),
        ...(profile.audio_character.timbre ?? []),
        profile.audio_character.density,
        profile.audio_character.brightness,
        profile.audio_character.warmth,
        profile.audio_character.punch,
        profile.audio_character.space,
        profile.audio_character.polish
    ]);
}
function promptTokens(profile) {
    const words = profile.generation_prompt.music_prompt.toLowerCase().match(/[a-z][a-z_-]{3,}/g) ?? [];
    return normalizedSet(words.filter((word) => !["with", "music", "instrumental", "production"].includes(word)));
}
function declaredSimilar(firstId, secondId, relationships) {
    return relationships.relationships
        .find((relationship) => relationship.profile_id === firstId)
        ?.similar_profiles.some((link) => link.profile_id === secondId) ?? false;
}
export function assessProfileConflict(first, second, relationships) {
    const firstSemantic = semantic(first);
    const secondSemantic = semantic(second);
    const firstApplication = application(first);
    const secondApplication = application(second);
    const firstRoles = roles(first);
    const secondRoles = roles(second);
    const firstIdentity = identity(first);
    const secondIdentity = identity(second);
    const firstAudio = audio(first);
    const secondAudio = audio(second);
    const identityAudioScore = (jaccard(firstIdentity, secondIdentity) + jaccard(firstAudio, secondAudio)) / 2;
    const semanticScore = jaccard(firstSemantic, secondSemantic);
    const applicationScore = jaccard(firstApplication, secondApplication);
    const roleScore = jaccard(firstRoles, secondRoles);
    const promptScore = jaccard(promptTokens(first), promptTokens(second));
    const score = semanticScore * 0.3 + applicationScore * 0.25 + roleScore * 0.2 + identityAudioScore * 0.2 + promptScore * 0.05;
    const signals = [];
    if (semanticScore >= 0.5)
        signals.push("high_semantic_keyword_overlap");
    if (applicationScore >= 0.6)
        signals.push("high_application_fit_overlap");
    if (identityAudioScore >= 0.6)
        signals.push("high_music_identity_audio_overlap");
    if (first.music_role.primary_role === second.music_role.primary_role && applicationScore >= 0.5) {
        signals.push("competing_primary_music_role");
    }
    const isDeclaredSimilar = declaredSimilar(first.metadata.id, second.metadata.id, relationships);
    const severity = score >= 0.82 ? "high" : score >= 0.7 ? "review" : "clear";
    const suggestedAction = severity === "high"
        ? "merge_or_narrow"
        : severity === "clear"
            ? "no_action"
            : isDeclaredSimilar
                ? "narrow_or_accept_relationship"
                : signals.includes("competing_primary_music_role")
                    ? "review_role_boundaries"
                    : "narrow_or_accept_relationship";
    const firstAll = new Set([...firstSemantic, ...firstApplication, ...firstRoles, ...firstIdentity, ...firstAudio]);
    const secondAll = new Set([...secondSemantic, ...secondApplication, ...secondRoles, ...secondIdentity, ...secondAudio]);
    return {
        profile_pair: [first.metadata.id, second.metadata.id],
        conflict_score: Number(score.toFixed(4)),
        shared_attributes: {
            semantic_keywords: intersection(firstSemantic, secondSemantic),
            application_fit: intersection(firstApplication, secondApplication),
            music_role: intersection(firstRoles, secondRoles),
            music_identity: intersection(firstIdentity, secondIdentity),
            audio_character: intersection(firstAudio, secondAudio)
        },
        differences: {
            first_only: difference(firstAll, secondAll).slice(0, 20),
            second_only: difference(secondAll, firstAll).slice(0, 20)
        },
        signals,
        declared_similar: isDeclaredSimilar,
        severity,
        suggested_action: suggestedAction
    };
}
export function detectProfileConflicts(profiles, relationships) {
    const conflicts = [];
    let evaluatedPairs = 0;
    for (let left = 0; left < profiles.length; left += 1) {
        for (let right = left + 1; right < profiles.length; right += 1) {
            evaluatedPairs += 1;
            const conflict = assessProfileConflict(profiles[left], profiles[right], relationships);
            if (conflict.severity !== "clear")
                conflicts.push(conflict);
        }
    }
    conflicts.sort((left, right) => right.conflict_score - left.conflict_score);
    return {
        status: conflicts.length === 0 ? "ok" : "conflicts_found",
        generated_at: new Date().toISOString(),
        summary: {
            evaluated_pairs: evaluatedPairs,
            review: conflicts.filter((conflict) => conflict.severity === "review").length,
            high: conflicts.filter((conflict) => conflict.severity === "high").length
        },
        conflicts
    };
}
export async function generateProfileConflictReport() {
    const [profiles, relationships] = await Promise.all([loadProfiles(), loadProfileRelationships()]);
    return detectProfileConflicts(profiles, relationships);
}
