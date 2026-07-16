#!/usr/bin/env node
import { Command, CommanderError } from "commander";
import { generateMakaronPrompt } from "./makaronPromptBuilder.js";
import { generateSeedAudioPrompt } from "./promptBuilder.js";
import { loadProfiles } from "./profileStore.js";
import { recommendProfile } from "./recommend.js";
import { queryMusic } from "./query.js";
import { queryAdapterSchema, queryInputSchema } from "./schema.js";
import { searchProfiles } from "./search.js";
import { NoMatchingProfileError } from "./types.js";
function writeJson(payload) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}
function writeError(payload, exitCode = 1) {
    writeJson(payload);
    process.exitCode = exitCode;
}
function parseNumber(value) {
    if (value === undefined) {
        return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
async function readStdin() {
    process.stdin.setEncoding("utf8");
    let raw = "";
    for await (const chunk of process.stdin) {
        raw += chunk;
    }
    return raw;
}
function buildSearchInput(options) {
    return {
        scene: typeof options.scene === "string" ? options.scene : undefined,
        contentScene: typeof options.contentScene === "string" ? options.contentScene : undefined,
        duration: parseNumber(typeof options.duration === "string" ? options.duration : undefined),
        mood: typeof options.mood === "string" ? options.mood : undefined,
        energy: parseNumber(typeof options.energy === "string" ? options.energy : undefined),
        energyLevel: parseNumber(typeof options.energyLevel === "string" ? options.energyLevel : undefined),
        usage: typeof options.usage === "string" ? options.usage : undefined,
        musicRole: typeof options.musicRole === "string" ? options.musicRole : undefined,
        vocalType: typeof options.vocalType === "string" ? options.vocalType : undefined,
        agent: typeof options.agent === "string" ? options.agent : undefined,
        limit: parseNumber(typeof options.limit === "string" ? options.limit : undefined)
    };
}
function buildWorkflowContext(options) {
    const context = {
        content_type: typeof options.contentType === "string" ? options.contentType : undefined,
        duration: parseNumber(typeof options.duration === "string" ? options.duration : undefined),
        style: typeof options.style === "string" ? options.style : undefined,
        target: typeof options.target === "string" ? options.target : undefined,
        platform: typeof options.platform === "string" ? options.platform : undefined
    };
    return Object.values(context).some((value) => value !== undefined) ? context : undefined;
}
function requireSearchTarget(input) {
    if (!input.scene && !input.contentScene) {
        return "scene or contentScene is required for prompt generation.";
    }
    return null;
}
function handleUnknownError(error) {
    if (error instanceof NoMatchingProfileError) {
        writeError({
            status: "error",
            error_code: error.code,
            message: error.message
        });
        return;
    }
    const message = error instanceof Error ? error.message : "Unexpected error.";
    process.stderr.write(`${message}\n`);
    writeError({
        status: "error",
        error_code: "INTERNAL_ERROR",
        message
    });
}
async function run() {
    const program = new Command();
    program
        .name("music-prompt")
        .description("Music profile search and Makaron Seed Audio prompt generator.")
        .version("0.8.0");
    program.configureOutput({
        writeOut: (text) => process.stderr.write(text),
        writeErr: (text) => process.stderr.write(text),
        outputError: (text, write) => write(text)
    });
    program.exitOverride();
    program
        .command("list")
        .option("--json", "output JSON", true)
        .action(async () => {
        try {
            const profiles = await loadProfiles();
            writeJson({
                status: "ok",
                count: profiles.length,
                profiles
            });
        }
        catch (error) {
            handleUnknownError(error);
        }
    });
    program
        .command("search")
        .option("--scene <scene>")
        .option("--content-scene <scene>")
        .option("--duration <seconds>")
        .option("--mood <mood>")
        .option("--energy <level>")
        .option("--energy-level <level>")
        .option("--usage <usage>")
        .option("--music-role <role>")
        .option("--vocal-type <type>")
        .option("--agent <agent>")
        .option("--limit <count>")
        .option("--json", "output JSON", true)
        .action(async (options) => {
        try {
            const query = buildSearchInput(options);
            const results = await searchProfiles(query);
            if (results.length === 0) {
                writeError({
                    status: "error",
                    error_code: "NO_MATCHING_PROFILE",
                    message: "No matching music profile found for the given query."
                });
                return;
            }
            writeJson({
                status: "ok",
                query,
                results: results.map((result) => ({
                    id: result.profile.metadata.id,
                    title: result.profile.metadata.title,
                    score: result.score,
                    reason: result.reason
                }))
            });
        }
        catch (error) {
            handleUnknownError(error);
        }
    });
    program
        .command("recommend")
        .requiredOption("--request <request>")
        .option("--duration <seconds>")
        .option("--content-type <contentType>")
        .option("--style <style>")
        .option("--target <target>")
        .option("--platform <platform>")
        .option("--json", "output JSON", true)
        .action(async (options) => {
        try {
            writeJson(await recommendProfile({
                request: options.request,
                duration: parseNumber(options.duration),
                workflow_context: buildWorkflowContext(options)
            }));
        }
        catch (error) {
            handleUnknownError(error);
        }
    });
    program
        .command("query")
        .description("read a JSON music request from stdin and return an agent-ready JSON result")
        .option("--adapter <adapter>", "generic, makaron, video_editor, or short_video_agent", "generic")
        .action(async (options) => {
        try {
            const adapterValidation = queryAdapterSchema.safeParse(options.adapter);
            if (!adapterValidation.success) {
                writeError({
                    status: "error",
                    error_code: "INVALID_ARGUMENTS",
                    message: `Unsupported adapter: ${String(options.adapter)}.`
                });
                return;
            }
            const raw = await readStdin();
            let decoded;
            try {
                decoded = JSON.parse(raw);
            }
            catch {
                writeError({
                    status: "error",
                    error_code: "INVALID_ARGUMENTS",
                    message: "query expects a valid JSON object on stdin."
                });
                return;
            }
            const validation = queryInputSchema.safeParse(decoded);
            if (!validation.success) {
                writeError({
                    status: "error",
                    error_code: "INVALID_ARGUMENTS",
                    message: validation.error.issues.map((issue) => issue.message).join("; ")
                });
                return;
            }
            writeJson(await queryMusic(validation.data, adapterValidation.data));
        }
        catch (error) {
            handleUnknownError(error);
        }
    });
    program
        .command("prompt")
        .option("--scene <scene>")
        .option("--content-scene <scene>")
        .option("--duration <seconds>")
        .option("--mood <mood>")
        .option("--energy <level>")
        .option("--energy-level <level>")
        .option("--usage <usage>")
        .option("--music-role <role>")
        .option("--vocal-type <type>")
        .option("--agent <agent>")
        .option("--json", "output JSON", true)
        .action(async (options) => {
        try {
            const input = buildSearchInput(options);
            const invalid = requireSearchTarget(input);
            if (invalid) {
                writeError({
                    status: "error",
                    error_code: "INVALID_ARGUMENTS",
                    message: invalid
                });
                return;
            }
            writeJson(await generateSeedAudioPrompt(input));
        }
        catch (error) {
            handleUnknownError(error);
        }
    });
    program
        .command("makaron-prompt")
        .option("--scene <scene>")
        .option("--content-scene <scene>")
        .option("--duration <seconds>")
        .option("--mood <mood>")
        .option("--energy <level>")
        .option("--energy-level <level>")
        .option("--usage <usage>")
        .option("--music-role <role>")
        .option("--vocal-type <type>")
        .option("--agent <agent>")
        .option("--user-prompt <prompt>")
        .option("--json", "output JSON", true)
        .action(async (options) => {
        try {
            const input = buildSearchInput(options);
            const invalid = requireSearchTarget(input);
            if (invalid) {
                writeError({
                    status: "error",
                    error_code: "INVALID_ARGUMENTS",
                    message: invalid
                });
                return;
            }
            if (typeof options.userPrompt !== "string" || options.userPrompt.trim().length === 0) {
                writeError({
                    status: "error",
                    error_code: "INVALID_ARGUMENTS",
                    message: "userPrompt is required for Makaron prompt generation."
                });
                return;
            }
            const userPrompt = options.userPrompt;
            writeJson(await generateMakaronPrompt({
                ...input,
                userPrompt
            }));
        }
        catch (error) {
            handleUnknownError(error);
        }
    });
    try {
        await program.parseAsync(process.argv);
    }
    catch (error) {
        if (error instanceof CommanderError) {
            if (error.code === "commander.helpDisplayed" || error.code === "commander.version") {
                process.exitCode = error.exitCode;
                return;
            }
            writeError({
                status: "error",
                error_code: "INVALID_ARGUMENTS",
                message: error.message
            });
            return;
        }
        throw error;
    }
}
run().catch((error) => {
    handleUnknownError(error);
});
