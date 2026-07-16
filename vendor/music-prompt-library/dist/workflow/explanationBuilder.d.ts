import type { QueryIntent } from "../intent/types.js";
import type { IntentMatch } from "../intentMatcher.js";
import type { AlternativeProfile, RecommendationMatchEvidence, RejectedRecommendation, WhyNotProfile, WhySelectedEvidence } from "../types.js";
export declare function buildExplanation(intent: QueryIntent, matches: IntentMatch[]): {
    reasoning_summary: string;
    why_selected: WhySelectedEvidence[];
    why_not: WhyNotProfile[];
    alternative_profiles: AlternativeProfile[];
    matched: RecommendationMatchEvidence[];
    rejected: RejectedRecommendation[];
};
