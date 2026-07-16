import type { ConfusionBenchmarkDataset, ConfusionBenchmarkReport } from "./types.js";
export declare const defaultConfusionBenchmarkPath: string;
export declare function loadConfusionBenchmark(filePath?: string): Promise<ConfusionBenchmarkDataset>;
export declare function runConfusionBenchmark(filePath?: string): Promise<ConfusionBenchmarkReport>;
