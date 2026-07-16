import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseQueryIntent } from "../intent/parser.js";
import { rankIntentAgainstProfiles } from "../intentMatcher.js";
import { loadProfiles } from "../profileStore.js";
import { evaluateActivationGate } from "./activationGate.js";
import { assessProfileConflict } from "./conflictDetector.js";
import { buildProfileQualityEntry } from "./qualityReport.js";
import { loadMusicTaxonomy, loadProfileCandidateBatch, loadProfileChangelog, loadProfileRelationships } from "./store.js";
import { validateKnowledgeBase } from "./validator.js";
const defaultActiveBenchmarkPath = join(process.cwd(), "data", "recommend_benchmark.json");
const taxonomyIssueCodes = new Set([
    "PROFILE_SCHEMA_INVALID",
    "UNKNOWN_TAXONOMY_REFERENCE",
    "UNKNOWN_FAMILY_REFERENCE"
]);
const relationshipIssueCodes = new Set([
    "RELATIONSHIP_TARGET_MISSING",
    "SELF_RELATIONSHIP",
    "DUPLICATE_SIMILAR_PROFILE",
    "DUPLICATE_FALLBACK_PROFILE",
    "DUPLICATE_FALLBACK_PRIORITY",
    "RELATIONSHIP_ENTRY_MISSING",
    "ASYMMETRIC_SIMILARITY",
    "UNKNOWN_FAMILY_REFERENCE"
]);
function rounded(value) {
    return Number(value.toFixed(4));
}
function buildRelationshipOverlay(activeRelationships, candidates) {
    const overlay = structuredClone(activeRelationships);
    const existingIds = new Set(overlay.relationships.map((relationship) => relationship.profile_id));
    overlay.relationships.push(...candidates
        .filter((candidate) => !existingIds.has(candidate.profile.metadata.id))
        .map((candidate) => structuredClone(candidate.staged_relationship)));
    const byId = new Map(overlay.relationships.map((relationship) => [relationship.profile_id, relationship]));
    for (const candidate of candidates) {
        for (const link of candidate.staged_relationship.similar_profiles) {
            const target = byId.get(link.profile_id);
            if (!target || target.similar_profiles.some((item) => item.profile_id === candidate.profile.metadata.id))
                continue;
            target.similar_profiles.push({
                profile_id: candidate.profile.metadata.id,
                weight: link.weight,
                reason: `Staged reciprocal link for candidate validation: ${candidate.profile.metadata.title}.`
            });
        }
    }
    return overlay;
}
function categoryCounts(candidate) {
    const counts = {
        zh_short: 0,
        en_short: 0,
        long_description: 0,
        contrast_negative: 0
    };
    for (const benchmarkCase of candidate.benchmark_cases)
        counts[benchmarkCase.category] += 1;
    return counts;
}
function differentiatorDimensions(candidate) {
    return Object.values(candidate.differentiators).filter((values) => values.length > 0).length;
}
export async function validateProfileCandidateBatch(activeBenchmarkPath = defaultActiveBenchmarkPath) {
    const [activeProfiles, taxonomy, activeRelationships, batch, activeBenchmarkRaw] = await Promise.all([
        loadProfiles(),
        loadMusicTaxonomy(),
        loadProfileRelationships(),
        loadProfileCandidateBatch(),
        readFile(activeBenchmarkPath, "utf8")
    ]);
    await loadProfileChangelog();
    const activeBenchmark = JSON.parse(activeBenchmarkRaw);
    const candidateProfiles = batch.candidates.map((candidate) => candidate.profile);
    const activeIds = new Set(activeProfiles.map((profile) => profile.metadata.id));
    const sandboxProfiles = [
        ...activeProfiles,
        ...candidateProfiles.filter((profile) => !activeIds.has(profile.metadata.id))
    ];
    const relationshipOverlay = buildRelationshipOverlay(activeRelationships, batch.candidates);
    const validation = validateKnowledgeBase(sandboxProfiles, taxonomy, relationshipOverlay);
    const activeById = new Map(activeProfiles.map((profile) => [profile.metadata.id, profile]));
    const candidateById = new Map(batch.candidates.map((candidate) => [candidate.profile.metadata.id, candidate]));
    const crossCandidateConflicts = [];
    for (let left = 0; left < candidateProfiles.length; left += 1) {
        for (let right = left + 1; right < candidateProfiles.length; right += 1) {
            const conflict = assessProfileConflict(candidateProfiles[left], candidateProfiles[right], relationshipOverlay);
            if (conflict.severity !== "clear")
                crossCandidateConflicts.push(conflict);
        }
    }
    const candidateBenchmarkIds = new Set(batch.candidates.flatMap((candidate) => candidate.benchmark_cases.map((item) => item.id)));
    const allBenchmark = [
        ...activeBenchmark
            .filter((item) => !candidateBenchmarkIds.has(item.id))
            .map((item) => ({ ...item, source: "active" })),
        ...batch.candidates.flatMap((candidate) => candidate.benchmark_cases.map((item) => ({ ...item, source: "candidate" })))
    ];
    const benchmarkResults = allBenchmark.map((benchmarkCase) => {
        const intent = parseQueryIntent(benchmarkCase.request, benchmarkCase.duration);
        const ranked = rankIntentAgainstProfiles(intent, sandboxProfiles, 3).map((match) => match.profile.metadata.id);
        return {
            ...benchmarkCase,
            top1: ranked[0],
            top1_hit: ranked[0] === benchmarkCase.expected_profile_id,
            top3_hit: ranked.includes(benchmarkCase.expected_profile_id)
        };
    });
    const legacyResults = benchmarkResults.filter((item) => item.source === "active");
    const candidateResults = benchmarkResults.filter((item) => item.source === "candidate");
    const globalTop1Rate = benchmarkResults.filter((item) => item.top1_hit).length / benchmarkResults.length;
    const globalTop3Rate = benchmarkResults.filter((item) => item.top3_hit).length / benchmarkResults.length;
    const registryHasError = validation.registry_issues.some((item) => item.severity === "error");
    const candidateValidations = batch.candidates.map((candidate) => {
        const profileId = candidate.profile.metadata.id;
        const qualityIssues = validation.profile_issues.get(profileId) ?? [];
        const quality = buildProfileQualityEntry(profileId, qualityIssues);
        const taxonomyIssues = qualityIssues.filter((item) => taxonomyIssueCodes.has(item.code));
        const lintPass = !registryHasError && !qualityIssues.some((item) => item.severity === "error");
        const relationshipValid = !registryHasError && !qualityIssues.some((item) => relationshipIssueCodes.has(item.code));
        const nearestConflicts = candidate.nearest_existing_profiles.map((nearestId) => {
            const nearest = activeById.get(nearestId);
            if (!nearest)
                throw new Error(`Candidate ${profileId} references unknown nearest Profile ${nearestId}.`);
            return assessProfileConflict(candidate.profile, nearest, relationshipOverlay);
        });
        const candidateCrossConflicts = crossCandidateConflicts.filter((item) => item.profile_pair.includes(profileId));
        const ownBenchmarkResults = candidateResults.filter((item) => item.expected_profile_id === profileId);
        const counts = categoryCounts(candidate);
        const requirementPass = candidate.benchmark_cases.length >= 6 && counts.zh_short >= 2 && counts.en_short >= 2 &&
            counts.long_description >= 1 && counts.contrast_negative >= 1;
        const top1Hits = ownBenchmarkResults.filter((item) => item.top1_hit).length;
        const top3Hits = ownBenchmarkResults.filter((item) => item.top3_hit).length;
        const top1Rate = ownBenchmarkResults.length > 0 ? top1Hits / ownBenchmarkResults.length : 0;
        const top3Rate = ownBenchmarkResults.length > 0 ? top3Hits / ownBenchmarkResults.length : 0;
        const conflictPass = [...nearestConflicts, ...candidateCrossConflicts].every((item) => item.severity === "clear");
        const hasThreeDimensions = differentiatorDimensions(candidate) >= 3;
        const risks = [];
        if (!taxonomyIssues.length && candidate.family_id !== candidate.staged_relationship.family_id) {
            risks.push("candidate_family_relationship_mismatch");
        }
        if (taxonomyIssues.length > 0)
            risks.push("taxonomy_validation_failed");
        if (quality.quality_score < 85)
            risks.push("quality_below_85");
        if (!lintPass)
            risks.push("lint_failed");
        if (!relationshipValid)
            risks.push("relationship_invalid");
        if (!hasThreeDimensions)
            risks.push("insufficient_differentiators");
        if (!conflictPass)
            risks.push("profile_conflict_requires_review");
        if (!requirementPass)
            risks.push("benchmark_requirement_incomplete");
        if (top1Rate < 5 / 6)
            risks.push("profile_top1_below_83_3_percent");
        if (top3Rate !== 1)
            risks.push("profile_top3_below_100_percent");
        if (globalTop1Rate < 0.95)
            risks.push("global_top1_below_95_percent");
        const readyForCreation = taxonomyIssues.length === 0 && quality.quality_score >= 85 && lintPass && relationshipValid &&
            hasThreeDimensions && conflictPass && requirementPass;
        const activation = evaluateActivationGate({
            status: candidate.profile.metadata.status,
            quality_score: quality.quality_score,
            lint_pass: lintPass,
            relationship_valid: relationshipValid,
            benchmark_cases: ownBenchmarkResults.length,
            benchmark_top1_rate: top1Rate,
            benchmark_top3_rate: top3Rate,
            global_top1_rate: globalTop1Rate
        });
        return {
            profile_id: profileId,
            family_id: candidate.family_id,
            taxonomy_validation: { pass: taxonomyIssues.length === 0, issues: taxonomyIssues },
            nearest_profile_conflicts: nearestConflicts,
            differentiators: candidate.differentiators,
            quality_score: quality.quality_score,
            quality_recommendation: quality.recommendation,
            quality_issues: qualityIssues,
            lint_pass: lintPass,
            relationship_valid: relationshipValid,
            benchmark: {
                cases: ownBenchmarkResults.length,
                category_counts: counts,
                requirement_pass: requirementPass,
                top1_hits: top1Hits,
                top3_hits: top3Hits,
                top1_rate: rounded(top1Rate),
                top3_rate: rounded(top3Rate)
            },
            risks,
            ready_for_profile_creation: readyForCreation,
            eligible_for_activation: readyForCreation && activation.eligible_for_activation
        };
    });
    const eligible = candidateValidations.filter((candidate) => candidate.eligible_for_activation).map((candidate) => candidate.profile_id);
    const blocked = candidateValidations.filter((candidate) => !candidate.eligible_for_activation).map((candidate) => candidate.profile_id);
    return {
        status: blocked.length === 0 ? "ready_for_review" : "risks_found",
        generated_at: new Date().toISOString(),
        batch_id: batch.batch_id,
        summary: {
            active_profiles_unchanged: activeProfiles.length,
            candidate_profiles: candidateProfiles.length,
            sandbox_profiles: sandboxProfiles.length,
            benchmark_cases: benchmarkResults.length,
            legacy_top1_rate: rounded(legacyResults.filter((item) => item.top1_hit).length / legacyResults.length),
            candidate_top1_rate: rounded(candidateResults.filter((item) => item.top1_hit).length / candidateResults.length),
            global_top1_rate: rounded(globalTop1Rate),
            global_top3_rate: rounded(globalTop3Rate),
            ready_for_profile_creation: candidateValidations.filter((candidate) => candidate.ready_for_profile_creation).length,
            eligible_for_activation: eligible.length
        },
        activation_eligible_candidates: eligible,
        blocked_candidates: blocked,
        cross_candidate_conflicts: crossCandidateConflicts,
        registry_issues: validation.registry_issues,
        candidates: candidateValidations
    };
}
