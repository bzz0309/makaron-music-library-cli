import type { AdaptedQueryResult, QueryAdapter, QueryInput, RecommendResult } from "./types.js";
export declare function formatQueryForAdapter(recommendation: RecommendResult, input: QueryInput, adapter: QueryAdapter): Promise<AdaptedQueryResult>;
