import type { ProfileQualityEntry, ProfileQualityIssue, ProfileQualityReport } from "./types.js";
export declare function buildProfileQualityEntry(profileId: string, issues: ProfileQualityIssue[]): ProfileQualityEntry;
export declare function generateProfileQualityReport(profilesPath?: string): Promise<ProfileQualityReport>;
