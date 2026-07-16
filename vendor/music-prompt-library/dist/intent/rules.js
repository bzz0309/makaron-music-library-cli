export const inferenceRules = [
    {
        all: ["手机", "发布"],
        patch: {
            "application_fit.domains": ["product_showcase", "technology"],
            "application_fit.usage_context": ["product_reveal"],
            "music_role": ["brand_signature"]
        },
        confidence: 0.82,
        evidence: "手机 + 发布"
    },
    {
        all: ["手机", "亮相"],
        patch: {
            "application_fit.domains": ["product_showcase", "technology"],
            "application_fit.usage_context": ["product_reveal"]
        },
        confidence: 0.82,
        evidence: "手机 + 亮相"
    },
    {
        all: ["城市", "穿行"],
        patch: {
            "application_fit.domains": ["urban_culture"],
            "application_fit.usage_context": ["night_drive"]
        },
        confidence: 0.8,
        evidence: "城市 + 穿行"
    },
    {
        all: ["product", "launch"],
        patch: {
            "application_fit.domains": ["product_showcase", "advertising"],
            "application_fit.usage_context": ["product_reveal"],
            "music_role": ["brand_signature"]
        },
        confidence: 0.82,
        evidence: "product + launch"
    },
    {
        all: ["高级", "科技"],
        patch: {
            "music_identity.mood": ["premium", "futuristic"],
            "audio_character.texture": ["clean", "minimal"],
            "audio_character.polish": ["premium"]
        },
        confidence: 0.76,
        evidence: "高级 + 科技"
    },
    {
        all: ["premium", "tech"],
        patch: {
            "music_identity.mood": ["premium", "futuristic"],
            "audio_character.texture": ["clean", "minimal"],
            "audio_character.polish": ["premium"]
        },
        confidence: 0.76,
        evidence: "premium + tech"
    },
    {
        all: ["旅行", "回忆"],
        patch: {
            "application_fit.usage_context": ["memory", "journey"],
            "music_identity.mood": ["nostalgic", "warm"],
            "music_role": ["emotional_support"]
        },
        confidence: 0.82,
        evidence: "旅行 + 回忆"
    },
    {
        all: ["travel", "memory"],
        patch: {
            "application_fit.usage_context": ["memory", "journey"],
            "music_identity.mood": ["nostalgic", "warm"],
            "music_role": ["emotional_support"]
        },
        confidence: 0.82,
        evidence: "travel + memory"
    }
];
export function applyEnergyConstraints(intent) {
    const text = intent.source.normalized_text;
    const quietConstraint = /(不要太(?:吵|炸|强)|别太(?:吵|炸|强)|不需要太(?:吵|炸|强)|not too (?:loud|intense|aggressive)|without (?:loud|aggressive))/i.exec(text);
    if (!quietConstraint)
        return;
    intent.constraints.negative_requirements.push({ value: "noisy", confidence: 1, evidence: [quietConstraint[0]], source: "explicit", polarity: "negative" }, { value: "high_energy", confidence: 0.95, evidence: [quietConstraint[0]], source: "explicit", polarity: "negative" });
    intent.music_identity.energy_level = {
        value: 3,
        maximum: 4,
        confidence: 0.95,
        evidence: [quietConstraint[0]],
        source: "explicit"
    };
}
