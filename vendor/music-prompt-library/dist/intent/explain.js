function values(items) {
    return items.map((item) => item.value);
}
export function summarizeIntent(intent) {
    const summary = [
        ...values(intent.application_fit.domains).map((value) => `application_fit=${value}`),
        ...values(intent.application_fit.usage_context).map((value) => `usage=${value}`),
        ...values(intent.music_role).map((value) => `music_role=${value}`),
        ...values(intent.music_identity.mood).map((value) => `mood=${value}`),
        ...values(intent.audio_character.texture).map((value) => `texture=${value}`)
    ];
    if (intent.music_identity.energy_level)
        summary.push(`energy=${intent.music_identity.energy_level.value}/5`);
    if (intent.constraints.duration_seconds)
        summary.push(`duration=${intent.constraints.duration_seconds}s`);
    return summary;
}
