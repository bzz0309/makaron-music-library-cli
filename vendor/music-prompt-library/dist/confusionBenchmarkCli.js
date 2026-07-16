#!/usr/bin/env node
import { runConfusionBenchmark } from "./benchmark/confusionBenchmark.js";
try {
    const report = await runConfusionBenchmark();
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    if (report.status !== "ok")
        process.exitCode = 1;
}
catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`${JSON.stringify({ status: "error", code: "CONFUSION_BENCHMARK_ERROR", message })}\n`);
    process.exitCode = 1;
}
