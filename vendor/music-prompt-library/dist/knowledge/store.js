import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { musicTaxonomySchema, profileCandidateBatchSchema, profileChangelogSchema, profileRelationshipRegistrySchema } from "./schema.js";
export const defaultTaxonomyPath = join(process.cwd(), "data", "music_taxonomy.json");
export const defaultRelationshipsPath = join(process.cwd(), "data", "profile_relationships.json");
export const defaultCandidateBatchPath = join(process.cwd(), "data", "profile_candidates_batch_01.json");
export const defaultProfileChangelogPath = join(process.cwd(), "data", "profile_changelog.json");
async function readJson(filePath) {
    return JSON.parse(await readFile(filePath, "utf8"));
}
export async function loadMusicTaxonomy(filePath = defaultTaxonomyPath) {
    return musicTaxonomySchema.parse(await readJson(filePath));
}
export async function loadProfileRelationships(filePath = defaultRelationshipsPath) {
    return profileRelationshipRegistrySchema.parse(await readJson(filePath));
}
export async function loadProfileCandidateBatch(filePath = defaultCandidateBatchPath) {
    return profileCandidateBatchSchema.parse(await readJson(filePath));
}
export async function loadProfileChangelog(filePath = defaultProfileChangelogPath) {
    return profileChangelogSchema.parse(await readJson(filePath));
}
