#!/usr/bin/env node
import { generateRelationshipGraphReport } from "./knowledge/relationshipGraph.js";
const formatIndex = process.argv.indexOf("--format");
const format = formatIndex >= 0 ? process.argv[formatIndex + 1] : "json";
try {
    if (!new Set(["json", "dot", "mmd"]).has(format))
        throw new Error("--format must be json, dot, or mmd.");
    const report = await generateRelationshipGraphReport();
    if (format === "dot")
        process.stdout.write(`${report.dot}\n`);
    else if (format === "mmd")
        process.stdout.write(`${report.mmd}\n`);
    else
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stdout.write(`${JSON.stringify({ status: "error", code: "RELATIONSHIP_GRAPH_ERROR", message })}\n`);
    process.exitCode = 1;
}
