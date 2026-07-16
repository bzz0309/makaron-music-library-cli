function requested(intent, dimension) {
    switch (dimension) {
        case "application_fit": return [...intent.application_fit.domains, ...intent.application_fit.content_types].map((item) => item.value);
        case "usage_context": return intent.application_fit.usage_context.map((item) => item.value);
        case "music_role": return intent.music_role.map((item) => item.value);
        case "mood": return intent.music_identity.mood.map((item) => item.value);
        case "audio_character": return Object.values(intent.audio_character).flat().map((item) => item.value);
        case "energy_level": return intent.music_identity.energy_level ? [String(intent.music_identity.energy_level.value)] : [];
        case "duration": return intent.constraints.duration_seconds ? [String(intent.constraints.duration_seconds)] : [];
        case "semantic_keywords": return intent.music_identity.genre.map((item) => item.value);
    }
}
function profileValues(match, dimension) {
    switch (dimension) {
        case "application_fit": return match.matched_attributes.application_fit;
        case "usage_context": return match.matched_attributes.usage;
        case "music_role": return match.matched_attributes.music_role;
        case "mood": return match.matched_attributes.mood;
        case "audio_character": return match.matched_attributes.audio_character;
        case "energy_level": return match.matched_attributes.energy_level ? [String(match.matched_attributes.energy_level.profile)] : [];
        case "duration": return match.matched_attributes.duration?.supported ? [String(match.matched_attributes.duration.requested)] : [];
        case "semantic_keywords": return match.matched_attributes.semantic_keywords;
    }
}
function evidence(intent, dimension) {
    const values = dimension === "application_fit"
        ? [...intent.application_fit.domains, ...intent.application_fit.content_types]
        : dimension === "usage_context" ? intent.application_fit.usage_context
            : dimension === "music_role" ? intent.music_role
                : dimension === "mood" ? intent.music_identity.mood
                    : dimension === "audio_character" ? Object.values(intent.audio_character).flat()
                        : [];
    return [...new Set(values.flatMap((item) => item.evidence))];
}
export function buildExplanation(intent, matches) {
    const [winner, ...alternatives] = matches;
    const dimensions = Object.keys(winner.score_breakdown)
        .filter((dimension) => dimension !== "penalties" && winner.score_breakdown[dimension] > 0);
    const matched = dimensions.map((dimension) => ({
        dimension,
        requested: requested(intent, dimension),
        profile_value: profileValues(winner, dimension),
        contribution: winner.score_breakdown[dimension],
        evidence: evidence(intent, dimension)
    }));
    const strongest = [...matched].sort((a, b) => b.contribution - a.contribution).slice(0, 3);
    const reasoning_summary = `Selected ${winner.profile.metadata.title} because ${strongest.map((item) => `${item.dimension} contributed ${item.contribution}`).join(", ")}.`;
    const rejected = alternatives.slice(0, 3).map((alternative) => {
        const reasons = [];
        for (const dimension of strongest.map((item) => item.dimension)) {
            if (alternative.score_breakdown[dimension] < winner.score_breakdown[dimension])
                reasons.push(`weaker ${dimension} fit`);
        }
        if (alternative.score_breakdown.penalties < 0)
            reasons.push(`constraint penalty ${alternative.score_breakdown.penalties}`);
        return { profile_id: alternative.profile.metadata.id, score: alternative.score, reasons: [...new Set(reasons)].slice(0, 3) };
    });
    const why_selected = strongest.map((item) => ({
        dimension: item.dimension,
        contribution: item.contribution,
        matched_values: item.profile_value,
        evidence: item.evidence,
        summary: `${item.dimension} matched ${item.profile_value.join(", ") || "the requested capability"}.`
    }));
    const requestedDimensions = matched.filter((item) => item.requested.length > 0);
    const why_not = alternatives.slice(0, 3).map((alternative) => {
        const reasons = [];
        const missingEvidence = [];
        for (const item of requestedDimensions) {
            if (alternative.score_breakdown[item.dimension] < winner.score_breakdown[item.dimension]) {
                reasons.push(`weaker ${item.dimension} fit`);
                missingEvidence.push(...item.requested.filter((value) => !profileValues(alternative, item.dimension).includes(value)));
            }
        }
        if (alternative.score_breakdown.penalties < 0)
            reasons.push(`constraint penalty ${alternative.score_breakdown.penalties}`);
        return {
            profile_id: alternative.profile.metadata.id,
            score: alternative.score,
            score_gap: Number((winner.score - alternative.score).toFixed(3)),
            reasons: [...new Set(reasons)].slice(0, 3),
            missing_evidence: [...new Set(missingEvidence)].slice(0, 5)
        };
    });
    const alternative_profiles = alternatives.slice(0, 3).map((alternative, index) => ({
        profile_id: alternative.profile.metadata.id,
        score: alternative.score,
        tradeoffs: why_not[index]?.reasons ?? []
    }));
    return { reasoning_summary, why_selected, why_not, alternative_profiles, matched, rejected };
}
