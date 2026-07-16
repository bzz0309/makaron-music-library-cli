import type { IntentField, QueryIntent } from "../intent/types.js";
export type WorkflowContext = {
    content_type?: string | string[];
    duration?: number;
    style?: string | string[];
    target?: string | string[];
    platform?: string | string[];
};
export type ConversationTurn = {
    request: string;
    workflow_context?: WorkflowContext;
};
export type WorkflowIntentField = IntentField | "music_identity.energy_level" | "constraints.duration_seconds" | "constraints.vocal_type" | "constraints.negative_requirements";
export type IntentOperation = {
    field: WorkflowIntentField;
    value: string | number;
    confidence: number;
    evidence: string[];
    maximum?: number;
};
export type IntentDelta = {
    turn_index: number;
    raw_request: string;
    add: IntentOperation[];
    remove: IntentOperation[];
    replace: IntentOperation[];
    constrain: IntentOperation[];
};
export type ConversationReduction = {
    intent: QueryIntent;
    deltas: IntentDelta[];
};
