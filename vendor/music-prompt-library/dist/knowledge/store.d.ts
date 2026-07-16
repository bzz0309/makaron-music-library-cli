import type { MusicTaxonomy, ProfileCandidateBatch, ProfileChangelog, ProfileRelationshipRegistry } from "./types.js";
export declare const defaultTaxonomyPath: string;
export declare const defaultRelationshipsPath: string;
export declare const defaultCandidateBatchPath: string;
export declare const defaultProfileChangelogPath: string;
export declare function loadMusicTaxonomy(filePath?: string): Promise<MusicTaxonomy>;
export declare function loadProfileRelationships(filePath?: string): Promise<ProfileRelationshipRegistry>;
export declare function loadProfileCandidateBatch(filePath?: string): Promise<ProfileCandidateBatch>;
export declare function loadProfileChangelog(filePath?: string): Promise<ProfileChangelog>;
