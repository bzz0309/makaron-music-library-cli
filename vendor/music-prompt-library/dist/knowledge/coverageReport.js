import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseQueryIntent } from "../intent/parser.js";
import { matchIntent } from "../intentMatcher.js";
import { loadProfiles } from "../profileStore.js";
import { loadMusicTaxonomy, loadProfileRelationships } from "./store.js";
const defaultBenchmarkPath = join(process.cwd(), "data", "recommend_benchmark.json");
function rounded(value) {
    return Number(value.toFixed(4));
}
export async function generateProfileCoverageReport(benchmarkPath = defaultBenchmarkPath) {
    const [profiles, taxonomy, relationships, benchmarkRaw] = await Promise.all([
        loadProfiles(),
        loadMusicTaxonomy(),
        loadProfileRelationships(),
        readFile(benchmarkPath, "utf8")
    ]);
    const benchmark = JSON.parse(benchmarkRaw);
    const familyByProfile = new Map(relationships.relationships.map((relationship) => [relationship.profile_id, relationship.family_id]));
    const coverageByProfile = new Map(profiles.map((profile) => {
        const familyId = familyByProfile.get(profile.metadata.id);
        if (!familyId)
            throw new Error(`Profile ${profile.metadata.id} has no family mapping.`);
        return [
            profile.metadata.id,
            {
                profile_id: profile.metadata.id,
                family_id: familyId,
                benchmark_cases: 0,
                top1_hits: 0,
                top3_hits: 0,
                top1_hit_rate: 0,
                top3_hit_rate: 0,
                selected_as_top1: 0,
                misses: 0,
                confused_with: []
            }
        ];
    }));
    const confusionCounts = new Map();
    for (const benchmarkCase of benchmark) {
        const expectedCoverage = coverageByProfile.get(benchmarkCase.expected_profile_id);
        if (!expectedCoverage) {
            throw new Error(`Benchmark ${benchmarkCase.id} references unknown Profile ${benchmarkCase.expected_profile_id}.`);
        }
        const intent = parseQueryIntent(benchmarkCase.request, benchmarkCase.duration);
        const matches = await matchIntent(intent, 3);
        const rankedIds = matches.map((match) => match.profile.metadata.id);
        const actualTop1 = rankedIds[0];
        expectedCoverage.benchmark_cases += 1;
        if (actualTop1 === benchmarkCase.expected_profile_id) {
            expectedCoverage.top1_hits += 1;
        }
        else {
            expectedCoverage.misses += 1;
            if (actualTop1) {
                const key = `${benchmarkCase.expected_profile_id}\u0000${actualTop1}`;
                confusionCounts.set(key, (confusionCounts.get(key) ?? 0) + 1);
            }
        }
        if (rankedIds.includes(benchmarkCase.expected_profile_id))
            expectedCoverage.top3_hits += 1;
        if (actualTop1) {
            const selected = coverageByProfile.get(actualTop1);
            if (selected)
                selected.selected_as_top1 += 1;
        }
    }
    const confusion = [...confusionCounts.entries()]
        .map(([key, count]) => {
        const [expected_profile_id, actual_profile_id] = key.split("\u0000");
        return { expected_profile_id: expected_profile_id, actual_profile_id: actual_profile_id, count };
    })
        .sort((left, right) => right.count - left.count || left.expected_profile_id.localeCompare(right.expected_profile_id));
    for (const coverage of coverageByProfile.values()) {
        coverage.top1_hit_rate = coverage.benchmark_cases > 0
            ? rounded(coverage.top1_hits / coverage.benchmark_cases)
            : 0;
        coverage.top3_hit_rate = coverage.benchmark_cases > 0
            ? rounded(coverage.top3_hits / coverage.benchmark_cases)
            : 0;
        coverage.confused_with = confusion
            .filter((item) => item.expected_profile_id === coverage.profile_id)
            .map((item) => ({ profile_id: item.actual_profile_id, count: item.count }));
    }
    const profileCoverage = [...coverageByProfile.values()].sort((left, right) => left.profile_id.localeCompare(right.profile_id));
    const families = taxonomy.families.map((family) => {
        const members = profileCoverage.filter((profile) => profile.family_id === family.id);
        const benchmarkCases = members.reduce((sum, profile) => sum + profile.benchmark_cases, 0);
        const top1Hits = members.reduce((sum, profile) => sum + profile.top1_hits, 0);
        const top3Hits = members.reduce((sum, profile) => sum + profile.top3_hits, 0);
        return {
            family_id: family.id,
            profile_count: members.length,
            target_profile_count: family.target_profile_count,
            benchmark_cases: benchmarkCases,
            top1_hits: top1Hits,
            top3_hits: top3Hits,
            top1_accuracy: benchmarkCases > 0 ? rounded(top1Hits / benchmarkCases) : 0,
            top3_accuracy: benchmarkCases > 0 ? rounded(top3Hits / benchmarkCases) : 0
        };
    });
    const uncoveredProfiles = profileCoverage.filter((profile) => profile.benchmark_cases === 0).map((profile) => profile.profile_id);
    const zeroHitProfiles = profileCoverage.filter((profile) => profile.selected_as_top1 === 0).map((profile) => profile.profile_id);
    const totalTop1 = profileCoverage.reduce((sum, profile) => sum + profile.top1_hits, 0);
    const totalTop3 = profileCoverage.reduce((sum, profile) => sum + profile.top3_hits, 0);
    const coveredProfiles = profileCoverage.length - uncoveredProfiles.length;
    return {
        status: uncoveredProfiles.length === 0 && zeroHitProfiles.length === 0 ? "ok" : "coverage_gaps",
        generated_at: new Date().toISOString(),
        summary: {
            total_profiles: profileCoverage.length,
            benchmark_cases: benchmark.length,
            covered_profiles: coveredProfiles,
            benchmark_coverage: profileCoverage.length > 0 ? rounded(coveredProfiles / profileCoverage.length) : 0,
            top1_accuracy: benchmark.length > 0 ? rounded(totalTop1 / benchmark.length) : 0,
            top3_accuracy: benchmark.length > 0 ? rounded(totalTop3 / benchmark.length) : 0
        },
        families,
        profiles: profileCoverage,
        confusion,
        zero_hit_profiles: zeroHitProfiles,
        uncovered_profiles: uncoveredProfiles
    };
}
