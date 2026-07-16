import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseQueryIntent } from "../intent/parser.js";
import { recommendProfile } from "../recommend.js";
import { confusionBenchmarkDatasetSchema } from "./schema.js";
export const defaultConfusionBenchmarkPath = join(process.cwd(), "data", "profile_confusion_benchmark.json");
function rounded(value) {
    return Number(value.toFixed(4));
}
function recognizedIntentValues(request, duration) {
    const intent = parseQueryIntent(request, duration);
    return new Set([
        ...intent.application_fit.domains,
        ...intent.application_fit.content_types,
        ...intent.application_fit.usage_context,
        ...intent.music_role,
        ...intent.music_identity.genre,
        ...intent.music_identity.mood,
        ...intent.music_identity.tempo_feel,
        ...Object.values(intent.audio_character).flat()
    ].map((item) => item.value));
}
export async function loadConfusionBenchmark(filePath = defaultConfusionBenchmarkPath) {
    const raw = JSON.parse(await readFile(filePath, "utf8"));
    return confusionBenchmarkDatasetSchema.parse(raw);
}
export async function runConfusionBenchmark(filePath = defaultConfusionBenchmarkPath) {
    const dataset = await loadConfusionBenchmark(filePath);
    const results = [];
    const confusion = new Map();
    let expectedHits = 0;
    let avoidanceHits = 0;
    let evidenceHits = 0;
    let evidenceTotal = 0;
    for (const benchmarkCase of dataset.cases) {
        const recommendation = await recommendProfile({ request: benchmarkCase.request, duration: benchmarkCase.duration });
        const recognized = recognizedIntentValues(benchmarkCase.request, benchmarkCase.duration);
        const recognizedEvidence = benchmarkCase.required_evidence.filter((item) => recognized.has(item));
        const missingEvidence = benchmarkCase.required_evidence.filter((item) => !recognized.has(item));
        const expectedTop1 = recommendation.profile_id === benchmarkCase.expected_profile_id;
        const forbiddenAvoided = !benchmarkCase.forbidden_profile_ids.includes(recommendation.profile_id);
        if (expectedTop1)
            expectedHits += 1;
        if (forbiddenAvoided)
            avoidanceHits += 1;
        evidenceHits += recognizedEvidence.length;
        evidenceTotal += benchmarkCase.required_evidence.length;
        if (!expectedTop1) {
            const key = `${benchmarkCase.expected_profile_id}\u0000${recommendation.profile_id}`;
            confusion.set(key, (confusion.get(key) ?? 0) + 1);
        }
        results.push({
            id: benchmarkCase.id,
            boundary: benchmarkCase.boundary,
            expected_profile_id: benchmarkCase.expected_profile_id,
            actual_profile_id: recommendation.profile_id,
            expected_top1: expectedTop1,
            forbidden_avoided: forbiddenAvoided,
            required_evidence: benchmarkCase.required_evidence,
            recognized_evidence: recognizedEvidence,
            missing_evidence: missingEvidence
        });
    }
    const cases = dataset.cases.length;
    const status = expectedHits === cases && avoidanceHits === cases && evidenceHits === evidenceTotal
        ? "ok"
        : "boundary_regressions";
    return {
        status,
        generated_at: new Date().toISOString(),
        summary: {
            cases,
            expected_top1_hits: expectedHits,
            expected_top1_accuracy: rounded(expectedHits / cases),
            forbidden_avoidance_hits: avoidanceHits,
            forbidden_avoidance_accuracy: rounded(avoidanceHits / cases),
            evidence_hits: evidenceHits,
            evidence_total: evidenceTotal,
            evidence_recall: rounded(evidenceHits / evidenceTotal)
        },
        confusion_matrix: [...confusion.entries()].map(([key, count]) => {
            const [expected_profile_id, actual_profile_id] = key.split("\u0000");
            return { expected_profile_id, actual_profile_id, count };
        }).sort((left, right) => right.count - left.count || left.expected_profile_id.localeCompare(right.expected_profile_id)),
        results
    };
}
