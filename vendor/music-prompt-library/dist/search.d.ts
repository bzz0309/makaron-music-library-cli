import type { MusicProfile, SearchInput, SearchResult } from "./types.js";
export declare function scoreProfile(profile: MusicProfile, input: SearchInput): SearchResult | null;
export declare function searchProfiles(input: SearchInput): Promise<SearchResult[]>;
