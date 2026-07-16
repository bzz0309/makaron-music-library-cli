import { detectIntentLanguage, normalizeCanonical, normalizeIntentText } from "../intent/normalizer.js";
import { resolveWorkflowContext } from "./contextResolver.js";
import { createIntentDelta } from "./intentRefiner.js";
function target(intent, field) {
    switch (field) {
        case "application_fit.domains": return intent.application_fit.domains;
        case "application_fit.usage_context": return intent.application_fit.usage_context;
        case "application_fit.content_types": return intent.application_fit.content_types;
        case "music_role": return intent.music_role;
        case "music_identity.mood": return intent.music_identity.mood;
        case "music_identity.genre": return intent.music_identity.genre;
        case "music_identity.tempo_feel": return intent.music_identity.tempo_feel;
        case "audio_character.texture": return intent.audio_character.texture;
        case "audio_character.brightness": return intent.audio_character.brightness;
        case "audio_character.warmth": return intent.audio_character.warmth;
        case "audio_character.punch": return intent.audio_character.punch;
        case "audio_character.space": return intent.audio_character.space;
        case "audio_character.polish": return intent.audio_character.polish;
        case "audio_character.density": return intent.audio_character.density;
    }
}
function add(intent, operation) {
    if (operation.field === "constraints.duration_seconds") {
        intent.constraints.duration_seconds = Number(operation.value);
        return;
    }
    if (operation.field === "constraints.negative_requirements") {
        const existing = intent.constraints.negative_requirements.find((item) => item.value === String(operation.value));
        if (existing) {
            existing.confidence = Math.max(existing.confidence, operation.confidence);
            existing.evidence = [...new Set([...existing.evidence, ...operation.evidence])];
            existing.source = "conversation";
            return;
        }
        intent.constraints.negative_requirements.push({
            value: String(operation.value), confidence: operation.confidence, evidence: operation.evidence,
            source: "conversation", polarity: "negative"
        });
        return;
    }
    if (operation.field === "constraints.vocal_type") {
        intent.constraints.vocal_type = {
            value: String(operation.value), confidence: operation.confidence, evidence: operation.evidence,
            source: "conversation", polarity: "positive"
        };
        return;
    }
    if (operation.field === "music_identity.energy_level") {
        intent.music_identity.energy_level = {
            value: Number(operation.value),
            confidence: operation.confidence,
            evidence: operation.evidence,
            source: "conversation",
            maximum: operation.maximum
        };
        return;
    }
    const items = target(intent, operation.field);
    const canonical = normalizeCanonical(String(operation.value));
    const existing = items.find((item) => normalizeCanonical(item.value) === canonical);
    if (existing) {
        existing.confidence = Math.max(existing.confidence, operation.confidence);
        existing.evidence = [...new Set([...existing.evidence, ...operation.evidence])];
        existing.source = "conversation";
        return;
    }
    items.push({ value: String(operation.value), confidence: operation.confidence, evidence: operation.evidence, source: "conversation", polarity: "positive" });
}
function remove(intent, operation) {
    if (operation.field === "music_identity.energy_level") {
        intent.music_identity.energy_level = undefined;
        return;
    }
    if (operation.field === "constraints.duration_seconds") {
        intent.constraints.duration_seconds = undefined;
        return;
    }
    if (operation.field === "constraints.vocal_type") {
        intent.constraints.vocal_type = undefined;
        return;
    }
    if (operation.field === "constraints.negative_requirements")
        return;
    const items = target(intent, operation.field);
    const canonical = normalizeCanonical(String(operation.value));
    const index = items.findIndex((item) => normalizeCanonical(item.value) === canonical);
    if (index >= 0)
        items.splice(index, 1);
    add(intent, {
        field: "constraints.negative_requirements",
        value: String(operation.value),
        confidence: operation.confidence,
        evidence: operation.evidence
    });
}
function applyDelta(intent, delta) {
    for (const operation of delta.remove)
        remove(intent, operation);
    const replacedFields = new Set(delta.replace.map((operation) => operation.field));
    for (const field of replacedFields) {
        if (field === "music_identity.energy_level")
            intent.music_identity.energy_level = undefined;
        else if (field === "constraints.duration_seconds")
            intent.constraints.duration_seconds = undefined;
        else if (field === "constraints.vocal_type")
            intent.constraints.vocal_type = undefined;
        else if (field !== "constraints.negative_requirements")
            target(intent, field).splice(0);
    }
    for (const operation of delta.replace)
        add(intent, operation);
    for (const operation of delta.add)
        add(intent, operation);
    for (const operation of delta.constrain)
        add(intent, operation);
}
export function reduceConversation(turns, context = {}) {
    const intent = resolveWorkflowContext(context);
    const deltas = [];
    turns.forEach((turn, index) => {
        if (turn.workflow_context) {
            const contextual = resolveWorkflowContext(turn.workflow_context);
            if (contextual.constraints.duration_seconds)
                intent.constraints.duration_seconds = contextual.constraints.duration_seconds;
        }
        const delta = createIntentDelta(turn.request, index);
        deltas.push(delta);
        applyDelta(intent, delta);
    });
    const raw = turns.map((turn) => turn.request).join(" | ");
    intent.source = { raw_request: raw, normalized_text: normalizeIntentText(raw), language: detectIntentLanguage(raw) };
    return { intent, deltas };
}
