import { parseQueryIntent } from "../intent/parser.js";
import { reduceConversation } from "./conversationReducer.js";
export function resolveWorkflowIntent(input) {
    const context = {
        ...(input.workflow_context ?? {}),
        ...(input.duration ? { duration: input.duration } : {})
    };
    if (input.turns)
        return reduceConversation(input.turns, context).intent;
    if (input.workflow_context)
        return reduceConversation([{ request: input.request }], context).intent;
    return parseQueryIntent(input.request, input.duration);
}
export function resolveWorkflowDuration(input) {
    if (input.duration)
        return input.duration;
    if (input.workflow_context?.duration)
        return input.workflow_context.duration;
    if (input.turns) {
        for (let index = input.turns.length - 1; index >= 0; index -= 1) {
            const duration = input.turns[index]?.workflow_context?.duration;
            if (duration)
                return duration;
            const match = input.turns[index]?.request.match(/(\d{1,3})\s*(?:秒|s(?:ec(?:ond)?s?)?\b)/i);
            if (match)
                return Number(match[1]);
        }
    }
    return undefined;
}
