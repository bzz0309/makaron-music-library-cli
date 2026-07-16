import { readFile } from "node:fs/promises";
import { agentAdapterProfilesSchema } from "./schema.js";
import { defaultAdaptersPath } from "./seedData.js";
export async function loadAgentAdapters(filePath = defaultAdaptersPath) {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return agentAdapterProfilesSchema.parse(parsed);
}
export async function getAgentAdapter(profileId, agent) {
    const adapters = await loadAgentAdapters();
    return adapters.find((entry) => entry.profile_id === profileId)?.adapters[agent];
}
export async function getMakaronAdapter(profileId) {
    const adapters = await loadAgentAdapters();
    return adapters.find((entry) => entry.profile_id === profileId)?.adapters.makaron;
}
