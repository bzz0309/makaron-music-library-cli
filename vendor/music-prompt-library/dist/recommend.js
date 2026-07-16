import { summarizeIntent } from "./intent/explain.js";
import { parseQueryIntent } from "./intent/parser.js";
import { matchIntent } from "./intentMatcher.js";
import { calculateConfidence } from "./workflow/confidence.js";
import { buildExplanation } from "./workflow/explanationBuilder.js";
import { resolveWorkflowIntent } from "./workflow/inputResolver.js";
import { NoMatchingProfileError } from "./types.js";
function firstValue(items) {
    return items[0]?.value;
}
// Compatibility bridge for callers that still inspect the v1.2 flat parser result.
export function parseRecommendationRequest(request, duration) {
    const intent = parseQueryIntent(request, duration);
    return {
        contentScene: firstValue(intent.application_fit.domains),
        usage: firstValue(intent.application_fit.usage_context),
        mood: firstValue(intent.music_identity.mood),
        energyLevel: intent.music_identity.energy_level?.value,
        musicRole: firstValue(intent.music_role),
        vocalType: intent.constraints.vocal_type?.value,
        duration: intent.constraints.duration_seconds,
        semanticQuery: request,
        matchedTerms: [
            ...intent.application_fit.domains,
            ...intent.application_fit.usage_context,
            ...intent.music_role,
            ...intent.music_identity.mood,
            ...Object.values(intent.audio_character).flat()
        ].flatMap((item) => item.evidence)
    };
}
export async function recommendProfile(input) {
    const intent = resolveWorkflowIntent(input);
    const matches = await matchIntent(intent, Math.max(4, input.limit ?? 1));
    const [best] = matches;
    if (!best)
        throw new NoMatchingProfileError("No recommendation matched the natural-language request.");
    const profile = best.profile;
    const evidence = summarizeIntent(intent);
    const strongestDimensions = Object.entries(best.score_breakdown)
        .filter(([key, value]) => key !== "penalties" && value > 0)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 4)
        .map(([key, value]) => `${key}=${value}`);
    const explanation = buildExplanation(intent, matches);
    const confidence = calculateConfidence(intent, matches);
    return {
        status: "ok",
        profile_id: profile.metadata.id,
        score: best.score,
        intent,
        score_breakdown: best.score_breakdown,
        reason: `Selected ${profile.metadata.title}. Interpreted: ${evidence.join(", ") || "semantic request"}. Score evidence: ${strongestDimensions.join(", ")}.`,
        ...explanation,
        confidence,
        matched_attributes: best.matched_attributes,
        music_prompt: profile.generation_prompt.music_prompt,
        arrangement_notes: profile.generation_prompt.arrangement_notes ?? "",
        recommended_usage: profile.application_fit.usage_context.join(", ")
    };
}
