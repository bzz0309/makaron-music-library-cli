import type { IntentPatch, QueryIntent } from "./types.js";
type InferenceRule = {
    all: string[];
    patch: IntentPatch;
    confidence: number;
    evidence: string;
};
export declare const inferenceRules: InferenceRule[];
export declare function applyEnergyConstraints(intent: QueryIntent): void;
export {};
