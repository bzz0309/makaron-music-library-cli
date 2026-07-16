export function evaluateActivationGate(input) {
    const checks = {
        is_draft: input.status === "draft",
        quality_at_least_85: input.quality_score >= 85,
        lint_pass: input.lint_pass,
        relationship_valid: input.relationship_valid,
        benchmark_coverage: input.benchmark_cases >= 6,
        profile_top1_at_least_83_3: input.benchmark_top1_rate >= 5 / 6,
        profile_top3_is_100: input.benchmark_top3_rate === 1,
        global_top1_at_least_95: input.global_top1_rate >= 0.95
    };
    const eligible_for_activation = Object.values(checks).every(Boolean);
    return {
        eligible_for_activation,
        checks,
        suggested_status: eligible_for_activation ? "active" : "draft"
    };
}
