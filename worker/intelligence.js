import profiles from '../vendor/music-prompt-library/data/music_profiles.json' with { type: 'json' };
import adapters from '../vendor/music-prompt-library/data/agent_adapters.json' with { type: 'json' };
import { summarizeIntent } from '../vendor/music-prompt-library/dist/intent/explain.js';
import { rankIntentAgainstProfiles } from '../vendor/music-prompt-library/dist/intentMatcher.js';
import { calculateConfidence } from '../vendor/music-prompt-library/dist/workflow/confidence.js';
import { buildExplanation } from '../vendor/music-prompt-library/dist/workflow/explanationBuilder.js';
import { resolveWorkflowDuration, resolveWorkflowIntent } from '../vendor/music-prompt-library/dist/workflow/inputResolver.js';

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
    matched_attributes: recommendation.matched_attributes,
  };
}

function formatForAdapter(recommendation, input, adapter) {
  if (adapter === 'generic') {
    return { ...baseResult(recommendation), music_prompt: recommendation.music_prompt, arrangement_notes: recommendation.arrangement_notes };
  }
  const profile = profiles.find((item) => item.metadata.id === recommendation.profile_id);
  const adapterConfig = adapters.find((entry) => entry.profile_id === recommendation.profile_id)?.adapters?.[adapter];
  if (!profile || !adapterConfig) throw new Error(`Adapter ${adapter} is not configured for profile ${recommendation.profile_id}.`);
  const duration = resolveWorkflowDuration(input) ?? profile.application_fit.recommended_duration_seconds[0];
  const arrangementNotes = profile.generation_prompt.arrangement_notes ?? '';
  if (adapter === 'makaron') {
    return {
      ...baseResult(recommendation),
      adapter,
      seed_audio: {
        music_prompt: profile.generation_prompt.music_prompt,
        sound_effect_prompt: profile.generation_prompt.sound_effect_prompt,
        producer_notes: profile.generation_prompt.producer_notes,
        arrangement_notes: arrangementNotes,
        negative_prompt: profile.generation_prompt.negative_prompt,
      },
    };
  }
  if (adapter === 'video_editor') {
    return {
      ...baseResult(recommendation),
      adapter,
      music_cue: {
        prompt: profile.generation_prompt.music_prompt,
        duration_seconds: duration,
        role: profile.music_role.primary_role,
        structure: profile.music_identity.structure ?? [],
        edit_points: profile.music_role.edit_function ?? [],
        loopability: profile.music_identity.loopability ?? 'medium',
        arrangement_notes: arrangementNotes,
      },
    };
  }
  return {
    ...baseResult(recommendation),
    adapter,
    short_video_music: {
      hook_prompt: profile.generation_prompt.music_prompt,
      duration_seconds: duration,
      energy_level: profile.music_identity.energy_level,
      music_role: profile.music_role.primary_role,
      beat_sync_notes: profile.music_role.edit_function ?? [],
      loopability: profile.music_identity.loopability ?? 'medium',
      arrangement_notes: arrangementNotes,
      negative_prompt: profile.generation_prompt.negative_prompt,
    },
  };
}

export function queryMusic(input, adapter = 'generic') {
  const intent = resolveWorkflowIntent(input);
  const matches = rankIntentAgainstProfiles(intent, profiles, Math.max(4, input.limit ?? 1));
  const [best] = matches;
  if (!best) throw new Error('No recommendation matched the natural-language request.');
  const profile = best.profile;
  const evidence = summarizeIntent(intent);
  const strongestDimensions = Object.entries(best.score_breakdown)
    .filter(([key, value]) => key !== 'penalties' && value > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([key, value]) => `${key}=${value}`);
  const explanation = buildExplanation(intent, matches);
  const recommendation = {
    status: 'ok',
    profile_id: profile.metadata.id,
    score: best.score,
    intent,
    score_breakdown: best.score_breakdown,
    reason: `Selected ${profile.metadata.title}. Interpreted: ${evidence.join(', ') || 'semantic request'}. Score evidence: ${strongestDimensions.join(', ')}.`,
    ...explanation,
    confidence: calculateConfidence(intent, matches),
    matched_attributes: best.matched_attributes,
    music_prompt: profile.generation_prompt.music_prompt,
    arrangement_notes: profile.generation_prompt.arrangement_notes ?? '',
    recommended_usage: profile.application_fit.usage_context.join(', '),
  };
  return formatForAdapter(recommendation, input, adapter);
}
