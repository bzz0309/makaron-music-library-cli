#!/usr/bin/env node
import { generateProfileCoverageReport } from "./knowledge/coverageReport.js";
try {
    const report = await generateProfileCoverageReport();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.stderr.write(`Coverage: ${report.summary.covered_profiles}/${report.summary.total_profiles} profiles, Top-1 ${report.summary.top1_accuracy}, Top-3 ${report.summary.top3_accuracy}.\n`);
}
catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected coverage report error.";
    process.stderr.write(`${message}\n`);
    process.stdout.write(`${JSON.stringify({ status: "error", message }, null, 2)}\n`);
    process.exitCode = 1;
}
