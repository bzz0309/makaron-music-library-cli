import { loadProfiles } from "./profileStore.js";
import { normalizeCanonical, normalizeIntentText } from "./intent/normalizer.js";
const WEIGHTS = {
    application_fit: 22,
    usage_context: 14,
    music_role: 15,
    semantic_keywords: 14,
    mood: 12,
    audio_character: 13,
    energy_level: 7,
    duration: 3
};
function matchQuality(candidate, expected) {
    const left = normalizeCanonical(candidate);
    const right = normalizeCanonical(expected);
    if (left === right)
        return 1;
    if (left.includes(right) || right.includes(left))
        return 0.8;
    return 0;
}
function matchIntentValues(intents, profileValues) {
    if (intents.length === 0)
        return { ratio: 0, matched: [] };
    let earned = 0;
    let possible = 0;
    const matched = [];
    for (const intent of intents) {
        if (intent.polarity === "negative")
            continue;
        possible += intent.confidence;
        const best = profileValues.reduce((current, value) => {
            const quality = matchQuality(value, intent.value);
            return quality > current.quality ? { quality, value } : current;
        }, { quality: 0, value: "" });
        earned += intent.confidence * best.quality;
        if (best.quality > 0 && best.value && !matched.includes(best.value))
            matched.push(best.value);
    }
    return { ratio: possible > 0 ? earned / possible : 0, matched };
}
function audioValues(profile) {
    const character = profile.audio_character;
    return [
        ...(character.texture ?? []),
        ...(character.timbre ?? []),
        character.density,
        character.brightness,
        character.warmth,
        character.punch,
        character.space,
        character.polish
    ].filter((value) => Boolean(value));
}
function profileSemanticValues(profile) {
    return [
        ...profile.metadata.semantic_keywords,
        ...(profile.metadata.aliases ?? []),
        ...(profile.metadata.legacy_ids ?? []),
        ...(profile.metadata.tags ?? []),
        ...profile.music_identity.genre,
        ...(profile.music_identity.sub_genre ?? []),
        ...(profile.music_identity.instrumentation ?? []),
        ...(profile.music_identity.rhythm ?? [])
    ];
}
function profileConstraintValues(profile) {
    return [
        ...profile.music_identity.genre,
        ...(profile.music_identity.sub_genre ?? []),
        ...profile.music_identity.mood,
        profile.music_role.primary_role,
        ...(profile.music_role.secondary_roles ?? []),
        ...profile.application_fit.domains,
        ...profile.application_fit.usage_context,
        ...audioValues(profile)
    ];
}
function semanticMatches(profile, request) {
    const normalizedRequest = normalizeIntentText(request).replace(/(?:一段|一个|一种|的|要|用|需要|品牌)/g, "");
    return profileSemanticValues(profile).filter((value) => {
        const normalized = normalizeIntentText(value).replace(/(?:一段|一个|一种|的|要|用|需要|品牌)/g, "");
        return normalized.length >= 2 && normalizedRequest.includes(normalized);
    });
}
function semanticRatio(matches) {
    if (matches.length === 0)
        return 0;
    const strength = matches.reduce((total, value) => total + Math.min(1, normalizeIntentText(value).length / 8), 0);
    return Math.min(1, strength);
}
const SPECIALIZED_EVIDENCE_TERMS = {
    corporate_innovation_001: ["企业创新文化", "组织成长", "组织升级", "企业创新", "corporate innovation", "organizational transformation", "innovation culture"],
    sustainable_brand_001: ["可持续品牌", "环保品牌", "品牌责任", "sustainable brand", "ethical brand", "purpose-driven brand"],
    fintech_trust_001: ["金融科技", "支付安全", "数字金融", "金融系统", "fintech", "financial technology", "payment security", "digital finance", "secure platform"],
    retail_momentum_001: ["多产品陈列", "商品系列", "零售音乐", "购物节奏", "retail momentum", "retail campaign", "shopping groove", "cross-category merchandising", "multi-product"],
    architectural_real_estate_001: ["建筑和地产项目", "建筑空间", "地产展示", "空间材质尺度", "architectural real estate", "architecture film", "property showcase", "spatial design"],
    couture_orchestral_001: ["高定时装", "高级定制", "管弦走秀", "couture orchestral", "couture runway", "editorial orchestra", "orchestral runway"],
    organic_skincare_minimal_001: ["天然护肤", "有机护肤", "护理仪式", "护肤成分", "organic skincare", "natural skincare", "care ritual", "ingredient detail"],
    crystalline_jewelry_signature_001: ["珠宝声音标志", "晶体质感", "宝石细节", "稀有价值", "crystalline jewelry", "fine jewelry", "jewelry signature", "facet reflection", "precious detail"],
    intimate_romance_001: ["亲密关系", "人物关系戏", "克制爱情", "爱情对话", "关系张力", "温柔连接", "intimate romance", "relationship score", "quiet relationship", "romantic tension", "vulnerable affection"],
    investigative_documentary_001: ["调查纪录片", "调查报道", "调查新闻", "证据推进", "事实叙事", "采访调查", "investigative documentary", "investigative journalism", "evidence pulse", "factual inquiry", "unfolding evidence"]
};
function hasSpecializedEvidence(profileId, request) {
    const normalizedRequest = normalizeIntentText(request);
    return (SPECIALIZED_EVIDENCE_TERMS[profileId] ?? []).some((term) => normalizedRequest.includes(normalizeIntentText(term)));
}
function rounded(value) {
    return Number(value.toFixed(3));
}
export function scoreIntentProfile(profile, intent) {
    const application = matchIntentValues([...intent.application_fit.domains, ...intent.application_fit.content_types], [...profile.application_fit.domains, ...(profile.application_fit.content_types ?? [])]);
    const usage = matchIntentValues(intent.application_fit.usage_context, profile.application_fit.usage_context);
    const primaryRole = matchIntentValues(intent.music_role, [profile.music_role.primary_role]);
    const secondaryRole = matchIntentValues(intent.music_role, profile.music_role.secondary_roles ?? []);
    const role = primaryRole.ratio > 0
        ? primaryRole
        : { ratio: secondaryRole.ratio * 0.85, matched: secondaryRole.matched };
    const mood = matchIntentValues(intent.music_identity.mood, [
        ...profile.music_identity.mood,
        ...(profile.music_role.emotional_function ?? [])
    ]);
    const requestedAudio = Object.values(intent.audio_character).flat();
    const audio = matchIntentValues(requestedAudio, audioValues(profile));
    const keywords = semanticMatches(profile, intent.source.raw_request);
    const genre = matchIntentValues(intent.music_identity.genre, [
        ...profile.music_identity.genre,
        ...(profile.music_identity.sub_genre ?? [])
    ]);
    const semanticEvidence = [...new Set([...keywords, ...genre.matched])];
    const specialized = profile.metadata.tags?.includes("specialized_capability") ?? false;
    const specializedEvidence = specialized && hasSpecializedEvidence(profile.metadata.id, intent.source.raw_request);
    const energyIntent = intent.music_identity.energy_level;
    const energyDistance = energyIntent ? Math.abs(profile.music_identity.energy_level - energyIntent.value) : 0;
    const energyRatio = energyIntent ? Math.max(0, 1 - energyDistance * 0.25) * energyIntent.confidence : 0;
    const duration = intent.constraints.duration_seconds;
    const durationSupported = duration ? profile.application_fit.recommended_duration_seconds.includes(duration) : false;
    let penalties = 0;
    if (energyIntent?.maximum && profile.music_identity.energy_level > energyIntent.maximum) {
        penalties -= Math.min(18, (profile.music_identity.energy_level - energyIntent.maximum) * 9);
    }
    const negatives = new Set(intent.constraints.negative_requirements.map((item) => item.value));
    if (negatives.has("noisy") && (profile.audio_character.density === "dense" || profile.audio_character.punch === "hard"))
        penalties -= 4;
    if (negatives.has("high_energy") && profile.music_identity.energy_level >= 5)
        penalties -= 8;
    if (negatives.has("commercial")) {
        if (profile.application_fit.domains.includes("advertising"))
            penalties -= 6;
        if (profile.music_role.primary_role === "brand_signature")
            penalties -= 4;
    }
    const directlyHandledNegatives = new Set(["noisy", "high_energy", "commercial"]);
    const hardAttributeNegatives = new Set(["deep_house", "brand_signature", "reflective", "thriller", "product_reveal"]);
    const constraintValues = profileConstraintValues(profile);
    for (const negative of negatives) {
        if (directlyHandledNegatives.has(negative) || !hardAttributeNegatives.has(negative))
            continue;
        if (constraintValues.some((value) => matchQuality(value, negative) > 0))
            penalties -= 20;
    }
    if (intent.constraints.vocal_type && profile.music_identity.vocal_type !== intent.constraints.vocal_type.value)
        penalties -= 20;
    if (specialized && !specializedEvidence)
        penalties -= 12;
    const score_breakdown = {
        application_fit: rounded(application.ratio * WEIGHTS.application_fit),
        usage_context: rounded(usage.ratio * WEIGHTS.usage_context),
        music_role: rounded(role.ratio * WEIGHTS.music_role),
        semantic_keywords: rounded(Math.min(1, semanticRatio(keywords) + genre.ratio * 0.25) * WEIGHTS.semantic_keywords
            + (specializedEvidence ? 10 : 0)),
        mood: rounded(mood.ratio * WEIGHTS.mood),
        audio_character: rounded(audio.ratio * WEIGHTS.audio_character),
        energy_level: rounded(energyRatio * WEIGHTS.energy_level),
        duration: duration ? (durationSupported ? WEIGHTS.duration : 0) : 0,
        penalties
    };
    const total = Object.values(score_breakdown).reduce((sum, value) => sum + value, 0);
    return {
        profile,
        score: rounded(Math.max(0, Math.min(100, total)) / 100),
        score_breakdown,
        matched_attributes: {
            application_fit: application.matched,
            usage: usage.matched,
            mood: mood.matched,
            music_role: role.matched,
            semantic_keywords: semanticEvidence,
            audio_character: audio.matched,
            ...(energyIntent ? { energy_level: { requested: energyIntent.value, profile: profile.music_identity.energy_level } } : {}),
            ...(duration ? { duration: { requested: duration, supported: durationSupported } } : {})
        }
    };
}
export async function matchIntent(intent, limit = 5) {
    const profiles = await loadProfiles();
    return rankIntentAgainstProfiles(intent, profiles, limit);
}
export function rankIntentAgainstProfiles(intent, profiles, limit = 5) {
    return profiles
        .map((profile) => scoreIntentProfile(profile, intent))
        .filter((result) => result.score > 0)
        .sort((a, b) => {
        if (b.score !== a.score)
            return b.score - a.score;
        if (b.score_breakdown.application_fit !== a.score_breakdown.application_fit) {
            return b.score_breakdown.application_fit - a.score_breakdown.application_fit;
        }
        if (b.score_breakdown.music_role !== a.score_breakdown.music_role) {
            return b.score_breakdown.music_role - a.score_breakdown.music_role;
        }
        if (b.score_breakdown.penalties !== a.score_breakdown.penalties)
            return b.score_breakdown.penalties - a.score_breakdown.penalties;
        return a.profile.metadata.id.localeCompare(b.profile.metadata.id);
    })
        .slice(0, limit);
}
