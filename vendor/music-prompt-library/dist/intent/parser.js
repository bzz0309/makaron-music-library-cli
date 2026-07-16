import { energySignals, intentDictionary, referenceMappings } from "./dictionaries.js";
import { detectIntentLanguage, normalizeCanonical, normalizeIntentText } from "./normalizer.js";
import { applyEnergyConstraints, inferenceRules } from "./rules.js";
function parseDuration(request) {
    const match = request.match(/(\d{1,3})\s*(?:秒|s(?:ec(?:ond)?s?)?\b)/i);
    return match ? Number(match[1]) : undefined;
}
function parseVocal(request) {
    const instrumental = /(纯音乐|无人声|不要人声|无歌词|no vocals?|instrumental|without vocals?)/i.exec(request);
    if (instrumental)
        return { value: "instrumental", confidence: 1, evidence: [instrumental[0]], source: "explicit", polarity: "positive" };
    const vocal = /(人声|演唱|歌手|vocal|singer)/i.exec(request);
    if (vocal)
        return { value: "vocal", confidence: 0.95, evidence: [vocal[0]], source: "explicit", polarity: "positive" };
    return undefined;
}
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
function addValue(intent, field, value, confidence, evidence, source) {
    const values = target(intent, field);
    const canonical = normalizeCanonical(value);
    const existing = values.find((item) => normalizeCanonical(item.value) === canonical && item.polarity === "positive");
    if (existing) {
        existing.confidence = Math.max(existing.confidence, confidence);
        if (!existing.evidence.includes(evidence))
            existing.evidence.push(evidence);
        if (source === "explicit" || (source === "phrase" && existing.source === "inferred"))
            existing.source = source;
        return;
    }
    values.push({ value, confidence, evidence: [evidence], source, polarity: "positive" });
}
function applyPatch(intent, patch, confidence, evidence) {
    for (const [field, values] of Object.entries(patch)) {
        if (field === "energy_level" || field === "energy_maximum")
            continue;
        if (!Array.isArray(values))
            continue;
        for (const value of values)
            addValue(intent, field, value, confidence, evidence, "inferred");
    }
    if (patch.energy_level) {
        intent.music_identity.energy_level = { value: patch.energy_level, confidence, evidence: [evidence], source: "inferred" };
    }
}
function createEmptyIntent(request, duration) {
    return {
        schema_version: "1.0",
        source: { raw_request: request, normalized_text: normalizeIntentText(request), language: detectIntentLanguage(request) },
        constraints: { duration_seconds: duration ?? parseDuration(request), vocal_type: parseVocal(request), negative_requirements: [] },
        application_fit: { domains: [], usage_context: [], content_types: [] },
        music_role: [],
        music_identity: { mood: [], genre: [], tempo_feel: [] },
        audio_character: { texture: [], brightness: [], warmth: [], punch: [], space: [], polish: [], density: [] },
        references: { named_references: [] },
        unresolved_terms: []
    };
}
function isNegated(text, term) {
    const normalizedTerm = normalizeIntentText(term);
    let index = text.indexOf(normalizedTerm);
    while (index >= 0) {
        const prefix = text.slice(Math.max(0, index - 32), index);
        if (/(?:不要|避免|别|无需|不是|不需|not|without|avoid)\s*[^,.;，。！？]{0,20}$/i.test(prefix))
            return true;
        index = text.indexOf(normalizedTerm, index + normalizedTerm.length);
    }
    return false;
}
export function parseQueryIntent(request, duration) {
    const intent = createEmptyIntent(request, duration);
    const text = intent.source.normalized_text;
    const orderedDictionary = [...intentDictionary].sort((a, b) => {
        const aLength = Math.max(0, ...[...a.zh, ...a.en].map((term) => term.length));
        const bLength = Math.max(0, ...[...b.zh, ...b.en].map((term) => term.length));
        return bLength - aLength;
    });
    for (const item of orderedDictionary) {
        const terms = [...item.zh, ...item.en].sort((a, b) => b.length - a.length);
        for (const term of terms) {
            if (!text.includes(normalizeIntentText(term)))
                continue;
            if (isNegated(text, term)) {
                const exists = intent.constraints.negative_requirements.some((value) => value.value === item.canonical);
                if (!exists) {
                    intent.constraints.negative_requirements.push({
                        value: item.canonical,
                        confidence: 0.95,
                        evidence: [term],
                        source: "explicit",
                        polarity: "negative"
                    });
                }
                continue;
            }
            addValue(intent, item.field, item.canonical, item.weight, term, item.specificity === "token" ? "explicit" : "phrase");
            if (item.implies)
                applyPatch(intent, item.implies, Math.max(0.55, item.weight - 0.15), term);
        }
    }
    for (const signal of energySignals) {
        const matched = signal.terms.find((term) => text.includes(normalizeIntentText(term)));
        if (!matched)
            continue;
        const current = intent.music_identity.energy_level;
        if (!current || signal.confidence > current.confidence) {
            intent.music_identity.energy_level = { value: signal.value, confidence: signal.confidence, evidence: [matched], source: "explicit" };
        }
    }
    for (const rule of inferenceRules) {
        if (rule.all.every((term) => text.includes(normalizeIntentText(term)))) {
            applyPatch(intent, rule.patch, rule.confidence, rule.evidence);
        }
    }
    for (const reference of referenceMappings) {
        const matched = reference.terms.find((term) => text.includes(normalizeIntentText(term)));
        if (!matched)
            continue;
        intent.references.named_references.push({
            name: reference.name,
            evidence: [matched],
            interpreted_as: reference.interpreted_as,
            imitation_requested: /(?:像|一样|style|like)/i.test(matched)
        });
        for (const value of reference.interpreted_as) {
            if (["clean", "minimal", "futuristic"].includes(value))
                addValue(intent, "audio_character.texture", value, 0.72, matched, "inferred");
            else
                addValue(intent, "music_identity.mood", value, 0.72, matched, "inferred");
        }
    }
    applyEnergyConstraints(intent);
    return intent;
}
