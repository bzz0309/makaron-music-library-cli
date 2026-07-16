import type { MusicProfile } from "../types.js";
import type { MusicTaxonomy, ProfileQualityIssue, ProfileRelationshipRegistry } from "./types.js";
export type KnowledgeValidationResult = {
    registry_issues: ProfileQualityIssue[];
    profile_issues: Map<string, ProfileQualityIssue[]>;
    valid_profiles: MusicProfile[];
};
export declare function validateKnowledgeBase(rawProfiles: unknown[], taxonomy: MusicTaxonomy, relationships: ProfileRelationshipRegistry): KnowledgeValidationResult;
