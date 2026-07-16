import { readFile } from "node:fs/promises";
import { musicProfilesSchema } from "./schema.js";
import { defaultProfilesPath } from "./seedData.js";
export async function loadProfiles(filePath = defaultProfilesPath) {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return musicProfilesSchema.parse(parsed);
}
