import { getAgentAdapter } from "./adapterStore.js";
import { loadProfiles } from "./profileStore.js";
import { resolveWorkflowDuration } from "./workflow/inputResolver.js";
function baseResult(recommendation) {
    return {
        profile_id: recommendation.profile_id,
        score: recommendation.score,
        intent: recommendation.intent,
        score_breakdown: recommendation.score_breakdown,
        reason: recommendation.reason,
        reasoning_summary: recommendation.reasoning_summary,
        why_selected: recommendation.why_selected,
        why_not: recommendation.why_not,
        alternative_profiles: recommendation.alternative_profiles,
        matched: recommendation.matched,
        rejected: recommendation.rejected,
        confidence: recommendation.confidence,
        matched_attributes: recommendation.matched_attributes
    };
}
export async function formatQueryForAdapter(recommendation, input, adapter) {
    if (adapter === "generic") {
        const result = {
            ...baseResult(recommendation),
            music_prompt: recommendation.music_prompt,
            arrangement_notes: recommendation.arrangement_notes
        };
        return result;
    }
    const profiles = await loadProfiles();
    const profile = profiles.find((item) => item.metadata.id === recommendation.profile_id);
    const adapterConfig = await getAgentAdapter(recommendation.profile_id, adapter);
    if (!profile || !adapterConfig) {
        throw new Error(`Adapter ${adapter} is not configured for profile ${recommendation.profile_id}.`);
    }
    const duration = resolveWorkflowDuration(input) ?? profile.application_fit.recommended_duration_seconds[0];
    const arrangementNotes = profile.generation_prompt.arrangement_notes ?? "";
    if (adapter === "makaron") {
        const result = {
            ...baseResult(recommendation),
            adapter,
            seed_audio: {
                music_prompt: profile.generation_prompt.music_prompt,
                sound_effect_prompt: profile.generation_prompt.sound_effect_prompt,
                producer_notes: profile.generation_prompt.producer_notes,
                arrangement_notes: arrangementNotes,
                negative_prompt: profile.generation_prompt.negative_prompt
            }
        };
        return result;
    }
    if (adapter === "video_editor") {
        const result = {
            ...baseResult(recommendation),
            adapter,
            music_cue: {
                prompt: profile.generation_prompt.music_prompt,
                duration_seconds: duration,
                role: profile.music_role.primary_role,
                structure: profile.music_identity.structure ?? [],
                edit_points: profile.music_role.edit_function ?? [],
                loopability: profile.music_identity.loopability ?? "medium",
                arrangement_notes: arrangementNotes
            }
        };
        return result;
    }
    const result = {
        ...baseResult(recommendation),
        adapter,
        short_video_music: {
            hook_prompt: profile.generation_prompt.music_prompt,
            duration_seconds: duration,
            energy_level: profile.music_identity.energy_level,
            music_role: profile.music_role.primary_role,
            beat_sync_notes: profile.music_role.edit_function ?? [],
            loopability: profile.music_identity.loopability ?? "medium",
            arrangement_notes: arrangementNotes,
            negative_prompt: profile.generation_prompt.negative_prompt
        }
    };
    return result;
}
