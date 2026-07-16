import type { RecommendInput, RecommendResult, SearchInput } from "./types.js";
type ParsedRecommendation = SearchInput & {
    matchedTerms: string[];
};
export declare function parseRecommendationRequest(request: string, duration?: number): ParsedRecommendation;
export declare function recommendProfile(input: RecommendInput): Promise<RecommendResult>;
export {};
