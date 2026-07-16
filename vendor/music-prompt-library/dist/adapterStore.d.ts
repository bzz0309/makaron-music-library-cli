import type { AgentAdapterProfile } from "./types.js";
export declare function loadAgentAdapters(filePath?: string): Promise<AgentAdapterProfile[]>;
export declare function getAgentAdapter(profileId: string, agent: keyof AgentAdapterProfile["adapters"]): Promise<AgentAdapterProfile["adapters"][typeof agent] | undefined>;
export declare function getMakaronAdapter(profileId: string): Promise<AgentAdapterProfile["adapters"]["makaron"] | undefined>;
