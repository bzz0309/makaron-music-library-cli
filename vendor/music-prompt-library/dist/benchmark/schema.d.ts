import { z } from "zod";
export declare const confusionBenchmarkCaseSchema: z.ZodObject<{
    id: z.ZodString;
    boundary: z.ZodString;
    request: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    expected_profile_id: z.ZodString;
    forbidden_profile_ids: z.ZodArray<z.ZodString, "many">;
    required_evidence: z.ZodArray<z.ZodString, "many">;
    boundary_reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    request: string;
    expected_profile_id: string;
    boundary: string;
    forbidden_profile_ids: string[];
    required_evidence: string[];
    boundary_reason: string;
    duration?: number | undefined;
}, {
    id: string;
    request: string;
    expected_profile_id: string;
    boundary: string;
    forbidden_profile_ids: string[];
    required_evidence: string[];
    boundary_reason: string;
    duration?: number | undefined;
}>;
export declare const confusionBenchmarkDatasetSchema: z.ZodEffects<z.ZodObject<{
    schema_version: z.ZodLiteral<"1.0">;
    cases: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        boundary: z.ZodString;
        request: z.ZodString;
        duration: z.ZodOptional<z.ZodNumber>;
        expected_profile_id: z.ZodString;
        forbidden_profile_ids: z.ZodArray<z.ZodString, "many">;
        required_evidence: z.ZodArray<z.ZodString, "many">;
        boundary_reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        request: string;
        expected_profile_id: string;
        boundary: string;
        forbidden_profile_ids: string[];
        required_evidence: string[];
        boundary_reason: string;
        duration?: number | undefined;
    }, {
        id: string;
        request: string;
        expected_profile_id: string;
        boundary: string;
        forbidden_profile_ids: string[];
        required_evidence: string[];
        boundary_reason: string;
        duration?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    schema_version: "1.0";
    cases: {
        id: string;
        request: string;
        expected_profile_id: string;
        boundary: string;
        forbidden_profile_ids: string[];
        required_evidence: string[];
        boundary_reason: string;
        duration?: number | undefined;
    }[];
}, {
    schema_version: "1.0";
    cases: {
        id: string;
        request: string;
        expected_profile_id: string;
        boundary: string;
        forbidden_profile_ids: string[];
        required_evidence: string[];
        boundary_reason: string;
        duration?: number | undefined;
    }[];
}>, {
    schema_version: "1.0";
    cases: {
        id: string;
        request: string;
        expected_profile_id: string;
        boundary: string;
        forbidden_profile_ids: string[];
        required_evidence: string[];
        boundary_reason: string;
        duration?: number | undefined;
    }[];
}, {
    schema_version: "1.0";
    cases: {
        id: string;
        request: string;
        expected_profile_id: string;
        boundary: string;
        forbidden_profile_ids: string[];
        required_evidence: string[];
        boundary_reason: string;
        duration?: number | undefined;
    }[];
}>;
