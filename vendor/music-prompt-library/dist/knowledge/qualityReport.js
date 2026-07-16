import { readFile } from "node:fs/promises";
import { defaultProfilesPath } from "../seedData.js";
import { loadMusicTaxonomy, loadProfileRelationships } from "./store.js";
import { validateKnowledgeBase } from "./validator.js";
const categoryCodes = {
    schema: ["PROFILE_SCHEMA_INVALID"],
    taxonomy: ["UNKNOWN_TAXONOMY_REFERENCE"],
    aliases: ["PROFILE_ALIAS_CONFLICT"],
    semantic_keywords: ["DUPLICATE_SEMANTIC_KEYWORD", "LOW_SEMANTIC_COVERAGE"],
    prompt_quality: [
        "MUSIC_PROMPT_TOO_SHORT",
        "NEGATIVE_PROMPT_WEAK",
        "PRODUCER_NOTES_WEAK",
        "ARRANGEMENT_NOTES_TOO_SHORT",
        "ARRANGEMENT_SECTION_MISSING"
    ],
    relationship_integrity: [
        "RELATIONSHIP_TARGET_MISSING",
        "SELF_RELATIONSHIP",
        "DUPLICATE_SIMILAR_PROFILE",
        "DUPLICATE_FALLBACK_PROFILE",
        "DUPLICATE_FALLBACK_PRIORITY",
        "RELATIONSHIP_ENTRY_MISSING",
        "UNKNOWN_FAMILY_REFERENCE",
        "ASYMMETRIC_SIMILARITY"
    ],
    profile_completeness: [
        "DESCRIPTION_TOO_SHORT",
        "AUDIO_CHARACTER_INCOMPLETE",
        "MUSIC_ROLE_INCOMPLETE",
        "APPLICATION_FIT_INCOMPLETE"
    ]
};
const maximumScores = {
    schema: 15,
    taxonomy: 15,
    aliases: 10,
    semantic_keywords: 10,
    prompt_quality: 20,
    relationship_integrity: 15,
    profile_completeness: 15
};
function scoreCategory(maximum, relevantIssues) {
    const deduction = relevantIssues.reduce((total, item) => {
        if (item.severity === "error") {
            return total + 7;
        }
        if (item.severity === "warning") {
            return total + 3;
        }
        return total + 1;
    }, 0);
    return Math.max(0, maximum - deduction);
}
export function buildProfileQualityEntry(profileId, issues) {
    const score_breakdown = Object.fromEntries(Object.keys(maximumScores).map((category) => {
        const relevantIssues = issues.filter((item) => categoryCodes[category].includes(item.code));
        return [category, scoreCategory(maximumScores[category], relevantIssues)];
    }));
    const quality_score = Object.values(score_breakdown).reduce((total, value) => total + value, 0);
    const hasSchemaError = issues.some((item) => item.code === "PROFILE_SCHEMA_INVALID");
    const hasError = issues.some((item) => item.severity === "error");
    const recommendation = hasSchemaError || quality_score < 70 ? "reject" : hasError || quality_score < 85 ? "draft" : "active";
    return { profile_id: profileId, quality_score, score_breakdown, issues, recommendation };
}
export async function generateProfileQualityReport(profilesPath = defaultProfilesPath) {
    const rawProfiles = JSON.parse(await readFile(profilesPath, "utf8"));
    if (!Array.isArray(rawProfiles)) {
        throw new Error("music_profiles.json must contain an array.");
    }
    const [taxonomy, relationships] = await Promise.all([loadMusicTaxonomy(), loadProfileRelationships()]);
    const validation = validateKnowledgeBase(rawProfiles, taxonomy, relationships);
    const profileIds = rawProfiles.map((rawProfile, index) => {
        if (typeof rawProfile === "object" && rawProfile !== null && "metadata" in rawProfile &&
            typeof rawProfile.metadata === "object" && rawProfile.metadata !== null && "id" in rawProfile.metadata &&
            typeof rawProfile.metadata.id === "string") {
            return rawProfile.metadata.id;
        }
        return `invalid_profile_${index}`;
    });
    const profiles = profileIds.map((profileId) => buildProfileQualityEntry(profileId, validation.profile_issues.get(profileId) ?? []));
    const allIssues = [...validation.registry_issues, ...profiles.flatMap((profile) => profile.issues)];
    return {
        status: allIssues.length === 0 ? "ok" : "issues_found",
        generated_at: new Date().toISOString(),
        summary: {
            total_profiles: profiles.length,
            active: profiles.filter((profile) => profile.recommendation === "active").length,
            draft: profiles.filter((profile) => profile.recommendation === "draft").length,
            reject: profiles.filter((profile) => profile.recommendation === "reject").length,
            errors: allIssues.filter((item) => item.severity === "error").length,
            warnings: allIssues.filter((item) => item.severity === "warning").length
        },
        registry_issues: validation.registry_issues,
        profiles
    };
}
