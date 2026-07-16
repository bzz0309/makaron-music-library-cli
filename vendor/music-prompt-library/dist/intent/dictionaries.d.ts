import type { DictionaryEntry } from "./types.js";
export declare const applicationDictionary: DictionaryEntry[];
export declare const usageDictionary: DictionaryEntry[];
export declare const roleDictionary: DictionaryEntry[];
export declare const moodDictionary: DictionaryEntry[];
export declare const genreDictionary: DictionaryEntry[];
export declare const audioCharacterDictionary: DictionaryEntry[];
export declare const tempoDictionary: DictionaryEntry[];
export declare const intentDictionary: DictionaryEntry[];
export declare const energySignals: ({
    value: 5;
    terms: string[];
    confidence: number;
} | {
    value: 4;
    terms: string[];
    confidence: number;
} | {
    value: 3;
    terms: string[];
    confidence: number;
} | {
    value: 2;
    terms: string[];
    confidence: number;
} | {
    value: 1;
    terms: string[];
    confidence: number;
})[];
export declare const referenceMappings: {
    name: string;
    terms: string[];
    interpreted_as: string[];
}[];
