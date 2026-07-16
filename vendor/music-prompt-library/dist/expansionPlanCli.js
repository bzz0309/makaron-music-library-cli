#!/usr/bin/env node
import { generateProfileExpansionPlan } from "./knowledge/expansionPlan.js";
try {
    const plan = await generateProfileExpansionPlan();
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    process.stderr.write(`Expansion plan: ${plan.current_profile_count} current, ${plan.target_profile_count} target, ${plan.suggested_new_profiles.length} proposed.\n`);
    if (plan.status === "invalid_plan")
        process.exitCode = 1;
}
catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected expansion plan error.";
    process.stderr.write(`${message}\n`);
    process.stdout.write(`${JSON.stringify({ status: "error", message }, null, 2)}\n`);
    process.exitCode = 1;
}
