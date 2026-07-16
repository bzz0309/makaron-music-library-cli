#!/usr/bin/env node
import { generateProfileConflictReport } from "./knowledge/conflictDetector.js";
try {
    const report = await generateProfileConflictReport();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.stderr.write(`Conflict detection: ${report.summary.evaluated_pairs} pairs, ${report.summary.review} review, ${report.summary.high} high.\n`);
    if (report.summary.high > 0)
        process.exitCode = 1;
}
catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected conflict report error.";
    process.stderr.write(`${message}\n`);
    process.stdout.write(`${JSON.stringify({ status: "error", message }, null, 2)}\n`);
    process.exitCode = 1;
}
