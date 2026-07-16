import type { QueryIntent } from "../intent/types.js";
import type { WorkflowRequest } from "../types.js";
export declare function resolveWorkflowIntent(input: WorkflowRequest): QueryIntent;
export declare function resolveWorkflowDuration(input: WorkflowRequest): number | undefined;
