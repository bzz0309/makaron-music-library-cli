export type ConfusionBenchmarkCase = {
    id: string;
    boundary: string;
    request: string;
    duration?: number;
    expected_profile_id: string;
    forbidden_profile_ids: string[];
    required_evidence: string[];
    boundary_reason: string;
};
export type ConfusionBenchmarkDataset = {
    schema_version: "1.0";
    cases: ConfusionBenchmarkCase[];
};
export type ConfusionBenchmarkCaseResult = {
    id: string;
    boundary: string;
    expected_profile_id: string;
    actual_profile_id: string;
    expected_top1: boolean;
    forbidden_avoided: boolean;
    required_evidence: string[];
    recognized_evidence: string[];
    missing_evidence: string[];
};
export type ConfusionBenchmarkReport = {
    status: "ok" | "boundary_regressions";
    generated_at: string;
    summary: {
        cases: number;
        expected_top1_hits: number;
        expected_top1_accuracy: number;
        forbidden_avoidance_hits: number;
        forbidden_avoidance_accuracy: number;
        evidence_hits: number;
        evidence_total: number;
        evidence_recall: number;
    };
    confusion_matrix: Array<{
        expected_profile_id: string;
        actual_profile_id: string;
        count: number;
    }>;
    results: ConfusionBenchmarkCaseResult[];
};
