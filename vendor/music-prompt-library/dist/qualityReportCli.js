#!/usr/bin/env node
import { generateProfileQualityReport } from "./knowledge/qualityReport.js";
try {
    const report = await generateProfileQualityReport();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (report.summary.errors > 0 || report.summary.reject > 0) {
        process.stderr.write("Profile knowledge validation failed.\n");
        process.exitCode = 1;
    }
    else {
        process.stderr.write(`Validated ${report.summary.total_profiles} profiles: ${report.summary.active} active, ${report.summary.draft} draft.\n`);
    }
}
catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected profile validation error.";
    process.stderr.write(`${message}\n`);
    process.stdout.write(`${JSON.stringify({ status: "error", message }, null, 2)}\n`);
    process.exitCode = 1;
}
