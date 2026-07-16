import { musicProfileSchema } from "../schema.js";
import { taxonomyDimensionIds } from "./schema.js";
function normalize(value) {
    return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
function issue(severity, code, message, path) {
    return { severity, code, message, ...(path ? { path } : {}) };
}
function addProfileIssue(issues, profileId, value) {
    const current = issues.get(profileId) ?? [];
    current.push(value);
    issues.set(profileId, current);
}
function validateTaxonomyRegistry(taxonomy) {
    const issues = [];
    const familyIds = new Set();
    for (const family of taxonomy.families) {
        const key = normalize(family.id);
        if (familyIds.has(key)) {
            issues.push(issue("error", "TAXONOMY_DUPLICATE_FAMILY", `Family ID ${family.id} is duplicated.`, "families"));
        }
        familyIds.add(key);
    }
    for (const dimensionId of taxonomyDimensionIds) {
        const dimension = taxonomy.dimensions[dimensionId];
        const canonicalByNormalized = new Map();
        for (const term of dimension.canonical) {
            const key = normalize(term);
            const previous = canonicalByNormalized.get(key);
            if (previous) {
                issues.push(issue("error", "TAXONOMY_DUPLICATE_CANONICAL", `Canonical values ${previous} and ${term} collide after normalization.`, `dimensions.${dimensionId}.canonical`));
            }
            canonicalByNormalized.set(key, term);
        }
        const aliasByNormalized = new Map();
        for (const [alias, target] of Object.entries(dimension.aliases)) {
            const aliasKey = normalize(alias);
            const targetKey = normalize(target);
            if (!canonicalByNormalized.has(targetKey)) {
                issues.push(issue("error", "TAXONOMY_ALIAS_TARGET_MISSING", `Alias ${alias} points to unknown canonical value ${target}.`, `dimensions.${dimensionId}.aliases.${alias}`));
            }
            const previousTarget = aliasByNormalized.get(aliasKey);
            if (previousTarget && normalize(previousTarget) !== targetKey) {
                issues.push(issue("error", "TAXONOMY_ALIAS_CONFLICT", `Alias ${alias} resolves to both ${previousTarget} and ${target}.`, `dimensions.${dimensionId}.aliases.${alias}`));
            }
            aliasByNormalized.set(aliasKey, target);
            const canonicalCollision = canonicalByNormalized.get(aliasKey);
            if (canonicalCollision && normalize(canonicalCollision) !== targetKey) {
                issues.push(issue("error", "TAXONOMY_ALIAS_CANONICAL_CONFLICT", `Alias ${alias} shadows canonical value ${canonicalCollision}.`, `dimensions.${dimensionId}.aliases.${alias}`));
            }
        }
    }
    return issues;
}
function profileTaxonomyValues(profile) {
    const roleValues = [profile.music_role.primary_role, ...(profile.music_role.secondary_roles ?? [])];
    return {
        genre: profile.music_identity.genre,
        mood: profile.music_identity.mood,
        application_domain: profile.application_fit.domains,
        usage_context: profile.application_fit.usage_context,
        music_role: roleValues,
        audio_density: profile.audio_character.density ? [profile.audio_character.density] : [],
        audio_brightness: profile.audio_character.brightness ? [profile.audio_character.brightness] : [],
        audio_warmth: profile.audio_character.warmth ? [profile.audio_character.warmth] : [],
        audio_punch: profile.audio_character.punch ? [profile.audio_character.punch] : [],
        audio_space: profile.audio_character.space ? [profile.audio_character.space] : [],
        audio_polish: profile.audio_character.polish ? [profile.audio_character.polish] : []
    };
}
function validateProfileTaxonomy(profile, taxonomy) {
    const issues = [];
    const values = profileTaxonomyValues(profile);
    for (const dimensionId of taxonomyDimensionIds) {
        const canonical = new Set(taxonomy.dimensions[dimensionId].canonical.map(normalize));
        for (const value of values[dimensionId]) {
            if (!canonical.has(normalize(value))) {
                issues.push(issue("error", "UNKNOWN_TAXONOMY_REFERENCE", `${value} is not a canonical ${dimensionId} value.`, dimensionId));
            }
        }
    }
    return issues;
}
function validateSemanticKeywords(profile) {
    const seen = new Set();
    const duplicates = new Set();
    for (const keyword of profile.metadata.semantic_keywords) {
        const key = normalize(keyword);
        if (seen.has(key)) {
            duplicates.add(keyword);
        }
        seen.add(key);
    }
    const issues = [];
    if (duplicates.size > 0) {
        issues.push(issue("error", "DUPLICATE_SEMANTIC_KEYWORD", `Duplicate semantic keywords: ${[...duplicates].join(", ")}.`, "metadata.semantic_keywords"));
    }
    if (seen.size < 12) {
        issues.push(issue("warning", "LOW_SEMANTIC_COVERAGE", `Only ${seen.size} unique semantic keywords; at least 12 are recommended.`, "metadata.semantic_keywords"));
    }
    return issues;
}
function validatePromptQuality(profile) {
    const issues = [];
    const prompt = profile.generation_prompt;
    const arrangement = prompt.arrangement_notes ?? "";
    if (prompt.music_prompt.trim().length < 120) {
        issues.push(issue("error", "MUSIC_PROMPT_TOO_SHORT", "music_prompt must contain at least 120 characters of production direction.", "generation_prompt.music_prompt"));
    }
    if (!prompt.negative_prompt || prompt.negative_prompt.trim().length < 30) {
        issues.push(issue("warning", "NEGATIVE_PROMPT_WEAK", "negative_prompt should contain at least 30 characters of useful exclusions.", "generation_prompt.negative_prompt"));
    }
    if (!prompt.producer_notes || prompt.producer_notes.trim().length < 30) {
        issues.push(issue("warning", "PRODUCER_NOTES_WEAK", "producer_notes should explain production priorities in at least 30 characters.", "generation_prompt.producer_notes"));
    }
    if (arrangement.length < 120) {
        issues.push(issue("error", "ARRANGEMENT_NOTES_TOO_SHORT", "arrangement_notes must contain at least 120 characters.", "generation_prompt.arrangement_notes"));
    }
    const requiredSections = [
        ["intro", /\bintro\s*:/i],
        ["development", /\b(build|main(?: loop)?|development)\s*:/i],
        ["ending", /\b(ending|end)\s*:/i],
        ["loop", /\bloop\s*:/i]
    ];
    if (profile.music_identity.intensity_curve && profile.music_identity.intensity_curve !== "flat") {
        requiredSections.push(["peak", /\b(drop|hook|lift|peak|climax|impact|accent|resolve)\s*:/i]);
    }
    for (const [section, pattern] of requiredSections) {
        if (!pattern.test(arrangement)) {
            issues.push(issue("warning", "ARRANGEMENT_SECTION_MISSING", `arrangement_notes should explicitly describe ${section}.`, "generation_prompt.arrangement_notes"));
        }
    }
    return issues;
}
function validateProfileCompleteness(profile) {
    const issues = [];
    if (!profile.metadata.description || profile.metadata.description.trim().length < 60) {
        issues.push(issue("warning", "DESCRIPTION_TOO_SHORT", "Profile description should explain reusable musical capability in at least 60 characters.", "metadata.description"));
    }
    if ((profile.audio_character.texture?.length ?? 0) < 2 || (profile.audio_character.timbre?.length ?? 0) < 2) {
        issues.push(issue("warning", "AUDIO_CHARACTER_INCOMPLETE", "audio_character should include at least two texture and two timbre descriptors.", "audio_character"));
    }
    if ((profile.music_role.narrative_function?.length ?? 0) === 0) {
        issues.push(issue("warning", "MUSIC_ROLE_INCOMPLETE", "music_role.narrative_function should describe the content function.", "music_role.narrative_function"));
    }
    if ((profile.application_fit.content_types?.length ?? 0) === 0) {
        issues.push(issue("warning", "APPLICATION_FIT_INCOMPLETE", "application_fit.content_types should contain reusable content categories.", "application_fit.content_types"));
    }
    return issues;
}
function validateProfileAliases(profiles, issues) {
    const owners = new Map();
    for (const profile of profiles) {
        const values = [profile.metadata.id, ...(profile.metadata.legacy_ids ?? []), ...(profile.metadata.aliases ?? [])];
        for (const value of values) {
            const key = normalize(value);
            const current = owners.get(key) ?? new Set();
            current.add(profile.metadata.id);
            owners.set(key, current);
        }
    }
    for (const [alias, profileIds] of owners) {
        if (profileIds.size < 2) {
            continue;
        }
        for (const profileId of profileIds) {
            addProfileIssue(issues, profileId, issue("error", "PROFILE_ALIAS_CONFLICT", `Alias ${alias} is owned by multiple profiles: ${[...profileIds].join(", ")}.`, "metadata.aliases"));
        }
    }
}
function findParentCycle(registry) {
    const parentById = new Map(registry.relationships
        .filter((relationship) => relationship.parent_profile_id)
        .map((relationship) => [relationship.profile_id, relationship.parent_profile_id]));
    for (const start of parentById.keys()) {
        const path = [];
        const indexById = new Map();
        let current = start;
        while (current) {
            const cycleStart = indexById.get(current);
            if (cycleStart !== undefined) {
                return [...path.slice(cycleStart), current];
            }
            indexById.set(current, path.length);
            path.push(current);
            current = parentById.get(current);
        }
    }
    return null;
}
function validateRelationships(registry, profileIds, familyIds, profileIssues) {
    const registryIssues = [];
    const entriesById = new Map();
    for (const relationship of registry.relationships) {
        if (entriesById.has(relationship.profile_id)) {
            registryIssues.push(issue("error", "DUPLICATE_RELATIONSHIP_ENTRY", `Multiple relationship entries exist for ${relationship.profile_id}.`, "relationships"));
        }
        entriesById.set(relationship.profile_id, relationship);
        if (!profileIds.has(relationship.profile_id)) {
            registryIssues.push(issue("error", "RELATIONSHIP_PROFILE_MISSING", `Relationship owner ${relationship.profile_id} does not exist.`, "relationships"));
            continue;
        }
        if (!familyIds.has(relationship.family_id)) {
            addProfileIssue(profileIssues, relationship.profile_id, issue("error", "UNKNOWN_FAMILY_REFERENCE", `Family ${relationship.family_id} does not exist in the taxonomy registry.`, "family_id"));
        }
        const references = [
            ...(relationship.parent_profile_id ? [relationship.parent_profile_id] : []),
            ...relationship.similar_profiles.map((link) => link.profile_id),
            ...relationship.fallback_profiles.map((link) => link.profile_id)
        ];
        for (const reference of references) {
            if (!profileIds.has(reference)) {
                addProfileIssue(profileIssues, relationship.profile_id, issue("error", "RELATIONSHIP_TARGET_MISSING", `Relationship target ${reference} does not exist.`, "relationships"));
            }
            if (reference === relationship.profile_id) {
                addProfileIssue(profileIssues, relationship.profile_id, issue("error", "SELF_RELATIONSHIP", "A Profile cannot relate to itself.", "relationships"));
            }
        }
        const similarIds = relationship.similar_profiles.map((link) => link.profile_id);
        const fallbackIds = relationship.fallback_profiles.map((link) => link.profile_id);
        const fallbackPriorities = relationship.fallback_profiles.map((link) => link.priority);
        if (new Set(similarIds).size !== similarIds.length) {
            addProfileIssue(profileIssues, relationship.profile_id, issue("error", "DUPLICATE_SIMILAR_PROFILE", "similar_profiles contains duplicate IDs.", "similar_profiles"));
        }
        if (new Set(fallbackIds).size !== fallbackIds.length) {
            addProfileIssue(profileIssues, relationship.profile_id, issue("error", "DUPLICATE_FALLBACK_PROFILE", "fallback_profiles contains duplicate IDs.", "fallback_profiles"));
        }
        if (new Set(fallbackPriorities).size !== fallbackPriorities.length) {
            addProfileIssue(profileIssues, relationship.profile_id, issue("error", "DUPLICATE_FALLBACK_PRIORITY", "Fallback priorities must be unique.", "fallback_profiles"));
        }
    }
    for (const profileId of profileIds) {
        if (!entriesById.has(profileId)) {
            addProfileIssue(profileIssues, profileId, issue("error", "RELATIONSHIP_ENTRY_MISSING", "Profile has no relationship registry entry.", "relationships"));
        }
    }
    for (const relationship of registry.relationships) {
        for (const similar of relationship.similar_profiles) {
            const reciprocal = entriesById
                .get(similar.profile_id)
                ?.similar_profiles.some((link) => link.profile_id === relationship.profile_id);
            if (!reciprocal && profileIds.has(similar.profile_id)) {
                addProfileIssue(profileIssues, relationship.profile_id, issue("warning", "ASYMMETRIC_SIMILARITY", `${similar.profile_id} does not link back to ${relationship.profile_id}.`, "similar_profiles"));
            }
        }
    }
    const cycle = findParentCycle(registry);
    if (cycle) {
        registryIssues.push(issue("error", "PARENT_CYCLE", `Parent relationship cycle detected: ${cycle.join(" -> ")}.`, "relationships"));
    }
    return registryIssues;
}
export function validateKnowledgeBase(rawProfiles, taxonomy, relationships) {
    const profileIssues = new Map();
    const validProfiles = [];
    const registryIssues = validateTaxonomyRegistry(taxonomy);
    rawProfiles.forEach((rawProfile, index) => {
        const result = musicProfileSchema.safeParse(rawProfile);
        const fallbackId = typeof rawProfile === "object" && rawProfile !== null &&
            "metadata" in rawProfile && typeof rawProfile.metadata === "object" && rawProfile.metadata !== null &&
            "id" in rawProfile.metadata && typeof rawProfile.metadata.id === "string"
            ? rawProfile.metadata.id
            : `invalid_profile_${index}`;
        if (!result.success) {
            for (const zodIssue of result.error.issues) {
                addProfileIssue(profileIssues, fallbackId, issue("error", "PROFILE_SCHEMA_INVALID", zodIssue.message, zodIssue.path.join(".")));
            }
            return;
        }
        const profile = result.data;
        validProfiles.push(profile);
        const profileId = profile.metadata.id;
        for (const profileIssue of [
            ...validateProfileTaxonomy(profile, taxonomy),
            ...validateSemanticKeywords(profile),
            ...validatePromptQuality(profile),
            ...validateProfileCompleteness(profile)
        ]) {
            addProfileIssue(profileIssues, profileId, profileIssue);
        }
    });
    validateProfileAliases(validProfiles, profileIssues);
    registryIssues.push(...validateRelationships(relationships, new Set(validProfiles.map((profile) => profile.metadata.id)), new Set(taxonomy.families.map((family) => family.id)), profileIssues));
    return { registry_issues: registryIssues, profile_issues: profileIssues, valid_profiles: validProfiles };
}
