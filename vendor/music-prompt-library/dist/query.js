import { formatQueryForAdapter } from "./adapterFormatter.js";
import { recommendProfile } from "./recommend.js";
export async function queryMusic(input, adapter = "generic") {
    const recommendation = await recommendProfile(input);
    return formatQueryForAdapter(recommendation, input, adapter);
}
