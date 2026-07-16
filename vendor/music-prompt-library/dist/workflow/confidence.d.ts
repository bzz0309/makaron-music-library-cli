import type { QueryIntent } from "../intent/types.js";
import type { IntentMatch } from "../intentMatcher.js";
import type { RecommendationConfidence } from "../types.js";
export declare function calculateConfidence(intent: QueryIntent, matches: IntentMatch[]): RecommendationConfidence;
