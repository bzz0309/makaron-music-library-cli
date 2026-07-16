import { parseQueryIntent } from "../intent/parser.js";
function values(value) {
    if (!value)
        return [];
    return Array.isArray(value) ? value : [value];
}
function markSource(items) {
    for (const item of items)
        item.source = "workflow_context";
}
export function resolveWorkflowContext(context = {}) {
    const contextText = [
        ...values(context.content_type),
        ...values(context.style),
        ...values(context.target)
    ].join(" ");
    const intent = parseQueryIntent(contextText || "workflow context", context.duration);
    for (const items of [
        intent.application_fit.domains,
        intent.application_fit.usage_context,
        intent.application_fit.content_types,
        intent.music_role,
        intent.music_identity.mood,
        intent.music_identity.genre,
        intent.music_identity.tempo_feel,
        ...Object.values(intent.audio_character)
    ])
        markSource(items);
    if (intent.music_identity.energy_level)
        intent.music_identity.energy_level.source = "workflow_context";
    if (intent.constraints.vocal_type)
        intent.constraints.vocal_type.source = "workflow_context";
    markSource(intent.constraints.negative_requirements);
    intent.source.raw_request = contextText;
    intent.source.normalized_text = contextText;
    intent.unresolved_terms = values(context.platform).map((platform) => `platform:${platform}`);
    return intent;
}
