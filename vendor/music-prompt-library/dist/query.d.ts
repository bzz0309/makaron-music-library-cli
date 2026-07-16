import type { AdaptedQueryResult, MakaronQueryResult, QueryAdapter, QueryInput, QueryResult, ShortVideoAgentQueryResult, VideoEditorQueryResult } from "./types.js";
export declare function queryMusic(input: QueryInput): Promise<QueryResult>;
export declare function queryMusic(input: QueryInput, adapter: "generic"): Promise<QueryResult>;
export declare function queryMusic(input: QueryInput, adapter: "makaron"): Promise<MakaronQueryResult>;
export declare function queryMusic(input: QueryInput, adapter: "video_editor"): Promise<VideoEditorQueryResult>;
export declare function queryMusic(input: QueryInput, adapter: "short_video_agent"): Promise<ShortVideoAgentQueryResult>;
export declare function queryMusic(input: QueryInput, adapter: QueryAdapter): Promise<AdaptedQueryResult>;
