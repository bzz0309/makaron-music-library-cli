export function normalizeIntentText(value) {
    return value
        .normalize("NFKC")
        .trim()
        .toLowerCase()
        .replace(/[，。！？；：、“”‘’（）【】]/g, " ")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");
}
export function detectIntentLanguage(value) {
    const hasChinese = /[\u3400-\u9fff]/u.test(value);
    const hasEnglish = /[a-z]/i.test(value);
    if (hasChinese && hasEnglish)
        return "mixed";
    if (hasChinese)
        return "zh";
    if (hasEnglish)
        return "en";
    return "unknown";
}
export function normalizeCanonical(value) {
    return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
