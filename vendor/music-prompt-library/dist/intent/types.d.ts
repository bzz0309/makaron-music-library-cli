export type IntentLanguage = "zh" | "en" | "mixed" | "unknown";
export type IntentSource = "explicit" | "phrase" | "inferred" | "workflow_context" | "conversation";
export type IntentPolarity = "positive" | "negative";
export type IntentValue<T = string> = {
    value: T;
    confidence: number;
    evidence: string[];
    source: IntentSource;
    polarity: IntentPolarity;
};
export type NumericIntent = {
    value: 1 | 2 | 3 | 4 | 5;
    confidence: number;
    evidence: string[];
    source: IntentSource;
    maximum?: 1 | 2 | 3 | 4 | 5;
};
export type NamedReference = {
    name: string;
    evidence: string[];
    interpreted_as: string[];
    imitation_requested: boolean;
};
export type QueryIntent = {
    schema_version: "1.0";
    source: {
        raw_request: string;
        normalized_text: string;
        language: IntentLanguage;
    };
    constraints: {
        duration_seconds?: number;
        vocal_type?: IntentValue<string>;
        negative_requirements: IntentValue<string>[];
    };
    application_fit: {
        domains: IntentValue<string>[];
        usage_context: IntentValue<string>[];
        content_types: IntentValue<string>[];
    };
    music_role: IntentValue<string>[];
    music_identity: {
        mood: IntentValue<string>[];
        genre: IntentValue<string>[];
        tempo_feel: IntentValue<string>[];
        energy_level?: NumericIntent;
    };
    audio_character: {
        texture: IntentValue<string>[];
        brightness: IntentValue<string>[];
        warmth: IntentValue<string>[];
        punch: IntentValue<string>[];
        space: IntentValue<string>[];
        polish: IntentValue<string>[];
        density: IntentValue<string>[];
    };
    references: {
        named_references: NamedReference[];
    };
    unresolved_terms: string[];
};
export type IntentField = "application_fit.domains" | "application_fit.usage_context" | "application_fit.content_types" | "music_role" | "music_identity.mood" | "music_identity.genre" | "music_identity.tempo_feel" | "audio_character.texture" | "audio_character.brightness" | "audio_character.warmth" | "audio_character.punch" | "audio_character.space" | "audio_character.polish" | "audio_character.density";
export type IntentPatch = Partial<Record<IntentField, string[]>> & {
    energy_level?: 1 | 2 | 3 | 4 | 5;
    energy_maximum?: 1 | 2 | 3 | 4 | 5;
};
export type DictionaryEntry = {
    canonical: string;
    field: IntentField;
    zh: string[];
    en: string[];
    weight: number;
    specificity: "token" | "phrase" | "compound";
    implies?: IntentPatch;
};
