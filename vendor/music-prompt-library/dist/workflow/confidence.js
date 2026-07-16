function rounded(value) {
    return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}
function intentValues(intent) {
    return [
        ...intent.application_fit.domains,
        ...intent.application_fit.usage_context,
        ...intent.application_fit.content_types,
        ...intent.music_role,
        ...intent.music_identity.mood,
        ...intent.music_identity.genre,
        ...intent.music_identity.tempo_feel,
        ...Object.values(intent.audio_character).flat()
    ];
}
export function calculateConfidence(intent, matches) {
    const [winner, runnerUp] = matches;
    const activeCoverage = [];
    if (intent.application_fit.domains.length + intent.application_fit.content_types.length > 0) {
        activeCoverage.push(winner.matched_attributes.application_fit.length / (intent.application_fit.domains.length + intent.application_fit.content_types.length));
    }
    if (intent.application_fit.usage_context.length > 0)
        activeCoverage.push(winner.matched_attributes.usage.length / intent.application_fit.usage_context.length);
    if (intent.music_role.length > 0)
        activeCoverage.push(winner.matched_attributes.music_role.length / intent.music_role.length);
    if (intent.music_identity.mood.length > 0)
        activeCoverage.push(winner.matched_attributes.mood.length / intent.music_identity.mood.length);
    if (intent.music_identity.genre.length > 0)
        activeCoverage.push(winner.matched_attributes.semantic_keywords.length > 0 ? 1 : 0);
    const requestedAudio = Object.values(intent.audio_character).flat();
    if (requestedAudio.length > 0)
        activeCoverage.push(winner.matched_attributes.audio_character.length / requestedAudio.length);
    if (intent.music_identity.energy_level)
        activeCoverage.push(winner.matched_attributes.energy_level ? 1 : 0);
    if (intent.constraints.duration_seconds)
        activeCoverage.push(winner.matched_attributes.duration?.supported ? 1 : 0);
    const coverage = activeCoverage.length ? activeCoverage.reduce((sum, value) => sum + Math.min(1, value), 0) / activeCoverage.length : 0.5;
    const values = intentValues(intent);
    const sourceWeight = { explicit: 1, phrase: 0.95, conversation: 1, workflow_context: 0.82, inferred: 0.7 };
    const specificity = values.length
        ? values.reduce((sum, item) => sum + item.confidence * sourceWeight[item.source], 0) / values.length
        : 0.5;
    const margin = runnerUp && winner.score > 0 ? Math.max(0, (winner.score - runnerUp.score) / winner.score) : 1;
    const constraintSatisfaction = Math.max(0, 1 + winner.score_breakdown.penalties / 20);
    const overall = rounded(coverage * 0.45 + specificity * 0.25 + margin * 0.2 + constraintSatisfaction * 0.1);
    return {
        overall,
        level: overall >= 0.8 ? "high" : overall >= 0.55 ? "medium" : "low",
        intent_coverage: rounded(coverage),
        evidence_specificity: rounded(specificity),
        ranking_margin: rounded(margin),
        constraint_satisfaction: rounded(constraintSatisfaction)
    };
}
