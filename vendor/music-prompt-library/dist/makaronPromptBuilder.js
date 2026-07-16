import { getMakaronAdapter } from "./adapterStore.js";
import { generateSeedAudioPrompt } from "./promptBuilder.js";
export async function generateMakaronPrompt(input) {
    const seedPrompt = await generateSeedAudioPrompt(input);
    await getMakaronAdapter(seedPrompt.profile_id);
    const sections = [
        input.userPrompt,
        `Add Seed Audio background music:\n${seedPrompt.music_prompt}`
    ];
    if (seedPrompt.sound_effect_prompt) {
        sections.push(`Add sound effects:\n${seedPrompt.sound_effect_prompt}`);
    }
    if (seedPrompt.producer_notes) {
        sections.push(`Music producer notes:\n${seedPrompt.producer_notes}`);
    }
    if (seedPrompt.arrangement_notes) {
        sections.push(`Music arrangement notes:\n${seedPrompt.arrangement_notes}`);
    }
    if (seedPrompt.negative_prompt) {
        sections.push(`Avoid:\n${seedPrompt.negative_prompt}`);
    }
    return {
        status: "ok",
        profile_id: seedPrompt.profile_id,
        agent: "makaron",
        makaron_prompt: sections.join("\n\n")
    };
}
