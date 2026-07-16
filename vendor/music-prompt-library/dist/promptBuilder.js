import { searchProfiles } from "./search.js";
import { NoMatchingProfileError } from "./types.js";
export async function generateSeedAudioPrompt(input) {
    const [best] = await searchProfiles({ ...input, limit: 1 });
    if (!best) {
        throw new NoMatchingProfileError();
    }
    const generationPrompt = best.profile.generation_prompt;
    return {
        status: "ok",
        profile_id: best.profile.metadata.id,
        generation_prompt: generationPrompt,
        music_prompt: generationPrompt.music_prompt,
        sound_effect_prompt: generationPrompt.sound_effect_prompt,
        negative_prompt: generationPrompt.negative_prompt,
        producer_notes: generationPrompt.producer_notes,
        arrangement_notes: generationPrompt.arrangement_notes
    };
}
