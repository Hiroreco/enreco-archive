import { NAMES_CHAPTER_2 } from "./constants.js";

// Configuration interface for type safety
export interface Config {
    // Feature toggles
    ENABLE_FIND_AND_REPLACE: boolean;
    ENABLE_WORD_SEARCH: boolean;
    ENABLE_CUSTOM_CHECKS: boolean;
    ENABLE_TEXTLINT: boolean;
    ENABLE_AUTOFIX: boolean;

    // Find and replace settings
    FIND_TERM: string;
    REPLACE_TERM: string;

    // Word search settings
    SEARCH_WORDS: string[];
    SEARCH_CASE_INSENSITIVE: boolean;

    // Custom validation settings
    CORRECT_NAMES: string[];
    ALLOWED_NAMES: string[];
    REDUNDANT_PHRASES: string[];
    FILLER_WORDS: string[];
    NAME_LEVENSHTEIN_THRESHOLD: number;
    REPETITION_MIN_WORD_LENGTH: number;
    STOP_WORDS: string[];

    // File processing settings
    CONTENT_FILE_EXTENSIONS: RegExp;
    OUTPUT_FILENAME: string;
    IGNORE_TEXTS_FOLDER: boolean;
}

// Configuration with defaults
export const CONFIG: Config = {
    ENABLE_FIND_AND_REPLACE: false,
    ENABLE_WORD_SEARCH: false,
    ENABLE_CUSTOM_CHECKS: true,
    ENABLE_TEXTLINT: true,
    ENABLE_AUTOFIX: false,

    FIND_TERM: "Raora",
    REPLACE_TERM: "Roa",

    SEARCH_WORDS: ["Humble", "Captive"],
    SEARCH_CASE_INSENSITIVE: true,

    CORRECT_NAMES: NAMES_CHAPTER_2,
    ALLOWED_NAMES: [],
    REDUNDANT_PHRASES: [
        "In fact",
        "a number of",
        "it is worth noting",
        "needless to say",
    ],
    FILLER_WORDS: [
        "very",
        "really",
        "actually",
        "just",
        "quite",
        "literally",
        "basically",
    ],
    NAME_LEVENSHTEIN_THRESHOLD: 1,
    REPETITION_MIN_WORD_LENGTH: 4,
    STOP_WORDS: [
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "is",
        "are",
        "was",
        "were",
        "in",
        "on",
        "at",
        "to",
        "of",
        "for",
        "by",
        "with",
        "it",
        "as",
        "this",
        "that",
        "have",
        "has",
        "had",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
    ],

    CONTENT_FILE_EXTENSIONS: /\.(md|txt|markdown)$/,
    OUTPUT_FILENAME: "scripts/proofread/report.md",
    IGNORE_TEXTS_FOLDER: true,
};
