#!/usr/bin/env node
import { validateProfileCandidateBatch } from "./knowledge/candidateValidator.js";
try {
    const report = await validateProfileCandidateBatch();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.stderr.write(`Candidate validation: ${report.summary.eligible_for_activation}/${report.summary.candidate_profiles} eligible; global Top-1 ${report.summary.global_top1_rate}.\n`);
    if (report.status === "risks_found")
        process.exitCode = 1;
}
catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected candidate validation error.";
    process.stderr.write(`${message}\n`);
    process.stdout.write(`${JSON.stringify({ status: "error", message }, null, 2)}\n`);
    process.exitCode = 1;
}
