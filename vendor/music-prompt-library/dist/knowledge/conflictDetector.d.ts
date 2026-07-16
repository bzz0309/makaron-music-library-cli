import type { MusicProfile } from "../types.js";
import type { ProfileConflict, ProfileConflictReport, ProfileRelationshipRegistry } from "./types.js";
export declare function assessProfileConflict(first: MusicProfile, second: MusicProfile, relationships: ProfileRelationshipRegistry): ProfileConflict;
export declare function detectProfileConflicts(profiles: MusicProfile[], relationships: ProfileRelationshipRegistry): ProfileConflictReport;
export declare function generateProfileConflictReport(): Promise<ProfileConflictReport>;
