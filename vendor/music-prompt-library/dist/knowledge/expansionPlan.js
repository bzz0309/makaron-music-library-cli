import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadProfiles } from "../profileStore.js";
import { loadMusicTaxonomy, loadProfileRelationships } from "./store.js";
const defaultCandidatesPath = join(process.cwd(), "data", "profile_expansion_candidates.json");
export async function generateProfileExpansionPlan(candidatesPath = defaultCandidatesPath) {
    const [profiles, taxonomy, relationships, candidatesRaw] = await Promise.all([
        loadProfiles(),
        loadMusicTaxonomy(),
        loadProfileRelationships(),
        readFile(candidatesPath, "utf8")
    ]);
    const candidateRegistry = JSON.parse(candidatesRaw);
    const familyIds = new Set(taxonomy.families.map((family) => family.id));
    const profileIds = new Set(profiles.map((profile) => profile.metadata.id));
    const activeTitles = new Set(profiles.map((profile) => profile.metadata.title.trim().toLowerCase()));
    const remainingCandidates = candidateRegistry.candidates.filter((candidate) => !activeTitles.has(candidate.title.trim().toLowerCase()));
    const issues = [];
    const candidateIds = new Set();
    for (const candidate of remainingCandidates) {
        if (candidateIds.has(candidate.candidate_id))
            issues.push(`Duplicate candidate ID: ${candidate.candidate_id}.`);
        candidateIds.add(candidate.candidate_id);
        if (!familyIds.has(candidate.family_id))
            issues.push(`Unknown candidate family: ${candidate.family_id}.`);
        if (candidate.nearest_profiles.length === 0)
            issues.push(`${candidate.candidate_id} has no nearest Profile.`);
        for (const nearest of candidate.nearest_profiles) {
            if (!profileIds.has(nearest))
                issues.push(`${candidate.candidate_id} references unknown nearest Profile ${nearest}.`);
        }
        if (candidate.differentiators.length < 3)
            issues.push(`${candidate.candidate_id} needs at least three differentiators.`);
    }
    const mapping = relationships.relationships
        .map((relationship) => ({ profile_id: relationship.profile_id, family_id: relationship.family_id }))
        .sort((left, right) => left.family_id.localeCompare(right.family_id) || left.profile_id.localeCompare(right.profile_id));
    const taxonomyGapMatrix = taxonomy.families.map((family) => {
        const current = mapping.filter((item) => item.family_id === family.id).length;
        const proposed = remainingCandidates.filter((candidate) => candidate.family_id === family.id).length;
        const gap = family.target_profile_count - current;
        if (proposed !== gap)
            issues.push(`${family.id} has gap ${gap} but ${proposed} proposed candidates.`);
        return {
            family_id: family.id,
            current_profiles: current,
            target_profiles: family.target_profile_count,
            gap,
            proposed_candidates: proposed
        };
    });
    return {
        status: issues.length === 0 ? "ready_for_review" : "invalid_plan",
        generated_at: new Date().toISOString(),
        current_profile_count: profiles.length,
        target_profile_count: taxonomy.families.reduce((sum, family) => sum + family.target_profile_count, 0),
        taxonomy_gap_matrix: taxonomyGapMatrix,
        current_profile_family_mapping: mapping,
        suggested_new_profiles: remainingCandidates,
        issues
    };
}
