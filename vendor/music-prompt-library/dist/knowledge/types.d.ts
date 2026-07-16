import type { MusicProfile } from "../types.js";
export type TaxonomyDimensionId = "genre" | "mood" | "application_domain" | "usage_context" | "music_role" | "audio_density" | "audio_brightness" | "audio_warmth" | "audio_punch" | "audio_space" | "audio_polish";
export type TaxonomyDimension = {
    description: string;
    canonical: string[];
    aliases: Record<string, string>;
};
export type TaxonomyFamily = {
    id: string;
    title: string;
    description: string;
    target_profile_count: number;
};
export type MusicTaxonomy = {
    schema_version: "1.1";
    families: TaxonomyFamily[];
    dimensions: Record<TaxonomyDimensionId, TaxonomyDimension>;
};
export type FallbackCondition = "low_confidence" | "constraint_conflict" | "profile_unavailable" | "profile_deprecated";
export type SimilarProfileLink = {
    profile_id: string;
    weight: number;
    reason: string;
    shared_attributes?: string[];
    differences?: string[];
};
export type FallbackProfileLink = {
    profile_id: string;
    priority: number;
    conditions: FallbackCondition[];
    reason: string;
};
export type ProfileRelationship = {
    profile_id: string;
    family_id: string;
    parent_profile_id?: string;
    similar_profiles: SimilarProfileLink[];
    fallback_profiles: FallbackProfileLink[];
};
export type ProfileRelationshipRegistry = {
    schema_version: "1.1";
    relationships: ProfileRelationship[];
};
export type RelationshipGraphNode = {
    profile_id: string;
    family_id: string;
};
export type RelationshipGraphEdge = {
    source: string;
    target: string;
    type: "parent" | "similar" | "fallback";
    weight?: number;
};
export type RelationshipGraphHealth = {
    status: "healthy" | "warnings";
    isolated_profiles: string[];
    over_connected_profiles: Array<{
        profile_id: string;
        connections: number;
    }>;
    missing_reciprocal_links: Array<{
        source: string;
        target: string;
    }>;
};
export type RelationshipGraphReport = {
    schema_version: "1.0";
    generated_at: string;
    summary: {
        profiles: number;
        families: number;
        edges: number;
        parent_edges: number;
        similar_edges: number;
        fallback_edges: number;
    };
    nodes: RelationshipGraphNode[];
    edges: RelationshipGraphEdge[];
    health: RelationshipGraphHealth;
    dot: string;
    mmd: string;
};
export type ProfileBenchmarkCoverage = {
    profile_id: string;
    family_id: string;
    benchmark_cases: number;
    top1_hits: number;
    top3_hits: number;
    top1_hit_rate: number;
    top3_hit_rate: number;
    selected_as_top1: number;
    misses: number;
    confused_with: Array<{
        profile_id: string;
        count: number;
    }>;
};
export type FamilyCoverage = {
    family_id: string;
    profile_count: number;
    target_profile_count: number;
    benchmark_cases: number;
    top1_hits: number;
    top3_hits: number;
    top1_accuracy: number;
    top3_accuracy: number;
};
export type ProfileCoverageReport = {
    status: "ok" | "coverage_gaps";
    generated_at: string;
    summary: {
        total_profiles: number;
        benchmark_cases: number;
        covered_profiles: number;
        benchmark_coverage: number;
        top1_accuracy: number;
        top3_accuracy: number;
    };
    families: FamilyCoverage[];
    profiles: ProfileBenchmarkCoverage[];
    confusion: Array<{
        expected_profile_id: string;
        actual_profile_id: string;
        count: number;
    }>;
    zero_hit_profiles: string[];
    uncovered_profiles: string[];
};
export type ConflictSeverity = "clear" | "review" | "high";
export type ConflictSuggestedAction = "no_action" | "merge_or_narrow" | "narrow_or_accept_relationship" | "review_role_boundaries";
export type ProfileConflict = {
    profile_pair: [string, string];
    conflict_score: number;
    shared_attributes: {
        semantic_keywords: string[];
        application_fit: string[];
        music_role: string[];
        music_identity: string[];
        audio_character: string[];
    };
    differences: {
        first_only: string[];
        second_only: string[];
    };
    signals: string[];
    declared_similar: boolean;
    severity: ConflictSeverity;
    suggested_action: ConflictSuggestedAction;
};
export type ProfileConflictReport = {
    status: "ok" | "conflicts_found";
    generated_at: string;
    summary: {
        evaluated_pairs: number;
        review: number;
        high: number;
    };
    conflicts: ProfileConflict[];
};
export type ActivationGateInput = {
    status: "active" | "draft" | "deprecated";
    quality_score: number;
    lint_pass: boolean;
    relationship_valid: boolean;
    benchmark_cases: number;
    benchmark_top1_rate: number;
    benchmark_top3_rate: number;
    global_top1_rate: number;
};
export type ActivationGateResult = {
    eligible_for_activation: boolean;
    checks: {
        is_draft: boolean;
        quality_at_least_85: boolean;
        lint_pass: boolean;
        relationship_valid: boolean;
        benchmark_coverage: boolean;
        profile_top1_at_least_83_3: boolean;
        profile_top3_is_100: boolean;
        global_top1_at_least_95: boolean;
    };
    suggested_status: "draft" | "active";
};
export type ProfileExpansionCandidate = {
    candidate_id: string;
    title: string;
    family_id: string;
    capability: string;
    nearest_profiles: string[];
    differentiators: string[];
    status: "proposed";
};
export type ProfileExpansionPlan = {
    status: "ready_for_review" | "invalid_plan";
    generated_at: string;
    current_profile_count: number;
    target_profile_count: number;
    taxonomy_gap_matrix: Array<{
        family_id: string;
        current_profiles: number;
        target_profiles: number;
        gap: number;
        proposed_candidates: number;
    }>;
    current_profile_family_mapping: Array<{
        profile_id: string;
        family_id: string;
    }>;
    suggested_new_profiles: ProfileExpansionCandidate[];
    issues: string[];
};
export type CandidateBenchmarkCategory = "zh_short" | "en_short" | "long_description" | "contrast_negative";
export type CandidateBenchmarkCase = {
    id: string;
    category: CandidateBenchmarkCategory;
    request: string;
    duration?: number;
    expected_profile_id: string;
};
export type ProfileCandidate = {
    profile: MusicProfile;
    family_id: string;
    nearest_existing_profiles: string[];
    differentiators: Record<"music_identity" | "audio_character" | "music_role" | "application_fit" | "arrangement_direction", string[]>;
    staged_relationship: ProfileRelationship;
    benchmark_cases: CandidateBenchmarkCase[];
};
export type ProfileCandidateBatch = {
    schema_version: "1.0";
    batch_id: string;
    candidates: ProfileCandidate[];
};
export type ProfileCandidateValidation = {
    profile_id: string;
    family_id: string;
    taxonomy_validation: {
        pass: boolean;
        issues: ProfileQualityIssue[];
    };
    nearest_profile_conflicts: ProfileConflict[];
    differentiators: ProfileCandidate["differentiators"];
    quality_score: number;
    quality_recommendation: ProfileQualityRecommendation;
    quality_issues: ProfileQualityIssue[];
    lint_pass: boolean;
    relationship_valid: boolean;
    benchmark: {
        cases: number;
        category_counts: Record<CandidateBenchmarkCategory, number>;
        requirement_pass: boolean;
        top1_hits: number;
        top3_hits: number;
        top1_rate: number;
        top3_rate: number;
    };
    risks: string[];
    ready_for_profile_creation: boolean;
    eligible_for_activation: boolean;
};
export type ProfileCandidateValidationReport = {
    status: "ready_for_review" | "risks_found";
    generated_at: string;
    batch_id: string;
    summary: {
        active_profiles_unchanged: number;
        candidate_profiles: number;
        sandbox_profiles: number;
        benchmark_cases: number;
        legacy_top1_rate: number;
        candidate_top1_rate: number;
        global_top1_rate: number;
        global_top3_rate: number;
        ready_for_profile_creation: number;
        eligible_for_activation: number;
    };
    activation_eligible_candidates: string[];
    blocked_candidates: string[];
    cross_candidate_conflicts: ProfileConflict[];
    registry_issues: ProfileQualityIssue[];
    candidates: ProfileCandidateValidation[];
};
export type ProfileChangelogAction = "created" | "merged" | "deprecated" | "renamed";
export type ProfileChangelogEntry = {
    profile_id: string;
    action: ProfileChangelogAction;
    version: string;
    reason: string;
    related_profiles: string[];
    previous_profile_id?: string;
    timestamp?: string;
};
export type ProfileChangelog = {
    schema_version: "1.0";
    entries: ProfileChangelogEntry[];
};
export type QualityIssueSeverity = "error" | "warning" | "info";
export type ProfileQualityIssue = {
    severity: QualityIssueSeverity;
    code: string;
    path?: string;
    message: string;
};
export type ProfileQualityRecommendation = "active" | "draft" | "reject";
export type ProfileQualityScoreBreakdown = {
    schema: number;
    taxonomy: number;
    aliases: number;
    semantic_keywords: number;
    prompt_quality: number;
    relationship_integrity: number;
    profile_completeness: number;
};
export type ProfileQualityEntry = {
    profile_id: string;
    quality_score: number;
    score_breakdown: ProfileQualityScoreBreakdown;
    issues: ProfileQualityIssue[];
    recommendation: ProfileQualityRecommendation;
};
export type ProfileQualityReport = {
    status: "ok" | "issues_found";
    generated_at: string;
    summary: {
        total_profiles: number;
        active: number;
        draft: number;
        reject: number;
        errors: number;
        warnings: number;
    };
    registry_issues: ProfileQualityIssue[];
    profiles: ProfileQualityEntry[];
};
export type ProfileGovernanceInput = {
    profiles: unknown[];
    taxonomy: MusicTaxonomy;
    relationships: ProfileRelationshipRegistry;
};
export type ValidatedProfileGovernanceInput = Omit<ProfileGovernanceInput, "profiles"> & {
    profiles: MusicProfile[];
};
