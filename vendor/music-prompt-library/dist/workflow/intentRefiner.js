import { parseQueryIntent } from "../intent/parser.js";
import { intentDictionary } from "../intent/dictionaries.js";
function fieldEntries(intent) {
    return [
        ["application_fit.domains", intent.application_fit.domains],
        ["application_fit.usage_context", intent.application_fit.usage_context],
        ["application_fit.content_types", intent.application_fit.content_types],
        ["music_role", intent.music_role],
        ["music_identity.mood", intent.music_identity.mood],
        ["music_identity.genre", intent.music_identity.genre],
        ["music_identity.tempo_feel", intent.music_identity.tempo_feel],
        ["audio_character.texture", intent.audio_character.texture],
        ["audio_character.brightness", intent.audio_character.brightness],
        ["audio_character.warmth", intent.audio_character.warmth],
        ["audio_character.punch", intent.audio_character.punch],
        ["audio_character.space", intent.audio_character.space],
        ["audio_character.polish", intent.audio_character.polish],
        ["audio_character.density", intent.audio_character.density]
    ];
}
function operation(field, item) {
    return { field, value: item.value, confidence: item.confidence, evidence: item.evidence };
}
export function createIntentDelta(request, turnIndex) {
    const parsed = parseQueryIntent(request);
    const delta = { turn_index: turnIndex, raw_request: request, add: [], remove: [], replace: [], constrain: [] };
    const replaceMode = /(改成|换成|替换为|instead|replace with|rather than)/i.test(request);
    const removeMode = /(去掉|移除|删掉|remove|drop the)/i.test(request);
    for (const [field, items] of fieldEntries(parsed)) {
        for (const item of items) {
            const next = operation(field, item);
            if (removeMode)
                delta.remove.push(next);
            else if (replaceMode)
                delta.replace.push(next);
            else
                delta.add.push(next);
        }
    }
    for (const item of parsed.constraints.negative_requirements) {
        for (const dictionaryEntry of intentDictionary.filter((entry) => entry.canonical === item.value)) {
            delta.remove.push({
                field: dictionaryEntry.field,
                value: item.value,
                confidence: item.confidence,
                evidence: item.evidence
            });
        }
        delta.constrain.push({
            field: "constraints.negative_requirements",
            value: item.value,
            confidence: item.confidence,
            evidence: item.evidence
        });
    }
    if (parsed.music_identity.energy_level) {
        const energy = parsed.music_identity.energy_level;
        const target = energy.maximum ? delta.constrain : replaceMode ? delta.replace : delta.add;
        target.push({
            field: "music_identity.energy_level",
            value: energy.value,
            confidence: energy.confidence,
            evidence: energy.evidence,
            maximum: energy.maximum
        });
    }
    if (parsed.constraints.duration_seconds) {
        delta.replace.push({
            field: "constraints.duration_seconds",
            value: parsed.constraints.duration_seconds,
            confidence: 1,
            evidence: [`${parsed.constraints.duration_seconds}s`]
        });
    }
    if (parsed.constraints.vocal_type) {
        delta.replace.push({
            field: "constraints.vocal_type",
            value: parsed.constraints.vocal_type.value,
            confidence: parsed.constraints.vocal_type.confidence,
            evidence: parsed.constraints.vocal_type.evidence
        });
    }
    if (/(不要太商业|别太商业|less commercial|not too commercial)/i.test(request)) {
        delta.constrain.push({
            field: "constraints.negative_requirements",
            value: "commercial",
            confidence: 1,
            evidence: [request]
        });
    }
    if (/(不要太?高能|别太?高能|not (?:too )?high energy|less intense)/i.test(request)) {
        delta.remove.push({ field: "music_identity.energy_level", value: 5, confidence: 1, evidence: [request] });
        delta.constrain.push({ field: "constraints.negative_requirements", value: "high_energy", confidence: 1, evidence: [request] });
        delta.constrain.push({ field: "music_identity.energy_level", value: 3, maximum: 3, confidence: 0.95, evidence: [request] });
    }
    return delta;
}
