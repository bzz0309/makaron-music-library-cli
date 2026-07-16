import { z } from "zod";
export const confusionBenchmarkCaseSchema = z.object({
    id: z.string().min(1),
    boundary: z.string().min(1),
    request: z.string().min(1),
    duration: z.number().int().positive().optional(),
    expected_profile_id: z.string().min(1),
    forbidden_profile_ids: z.array(z.string().min(1)).min(1),
    required_evidence: z.array(z.string().min(1)).min(1),
    boundary_reason: z.string().min(1)
});
export const confusionBenchmarkDatasetSchema = z.object({
    schema_version: z.literal("1.0"),
    cases: z.array(confusionBenchmarkCaseSchema).min(1)
}).superRefine((dataset, context) => {
    const ids = new Set();
    for (const [index, benchmarkCase] of dataset.cases.entries()) {
        if (ids.has(benchmarkCase.id)) {
            context.addIssue({ code: z.ZodIssueCode.custom, message: "Duplicate benchmark case id.", path: ["cases", index, "id"] });
        }
        ids.add(benchmarkCase.id);
        if (benchmarkCase.forbidden_profile_ids.includes(benchmarkCase.expected_profile_id)) {
            context.addIssue({ code: z.ZodIssueCode.custom, message: "Expected Profile cannot be forbidden.", path: ["cases", index, "forbidden_profile_ids"] });
        }
    }
});
