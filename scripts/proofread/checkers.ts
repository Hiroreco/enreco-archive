import { createLinter, loadTextlintrc } from "textlint";
import type { TextlintResult } from "@textlint/types";
import { Config } from "./config.js";
import { Issue } from "./types.js";
import { Utils } from "./utils.js";

// Base checker class for extensibility
export abstract class BaseChecker {
    protected config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    abstract check(content: string, filePath: string): Promise<Issue[]>;
    abstract getCategory(): string;
}

// TextLint integration (v15+)
export class TextLintChecker extends BaseChecker {
    async check(content: string, filePath: string): Promise<Issue[]> {
        // Load .textlintrc config from project root
        const descriptor = await loadTextlintrc();
        const linter = createLinter({ descriptor });
        // Lint the text content
        const result = await linter.lintText(content, filePath);
        const results = Array.isArray(result) ? result : [result];
        return this.convertTextLintResults(results, filePath);
    }

    private convertTextLintResults(
        results: TextlintResult[],
        filePath: string,
    ): Issue[] {
        const issues: Issue[] = [];
        results.forEach((result) => {
            result.messages.forEach((message) => {
                issues.push({
                    file: filePath,
                    line: message.line,
                    column: message.column,
                    type: message.severity === 2 ? "error" : "warning",
                    category: this.getCategory(),
                    message: message.message,
                    ruleId: message.ruleId,
                    severity: message.severity,
                    context: this.getContextLine(result.filePath, message.line),
                });
            });
        });
        return issues;
    }

    private getContextLine(filePath: string, lineNumber: number): string {
        // Implement if needed to retrieve actual line content
        return `Line ${lineNumber}`;
    }

    getCategory(): string {
        return "Common Mispeplling";
    }
}

// Custom name checker
export class NameChecker extends BaseChecker {
    async check(content: string, filePath: string): Promise<Issue[]> {
        const issues: Issue[] = [];
        const lines = content.split("\n");
        const correctNames = this.config.CORRECT_NAMES.map((n) =>
            n.toLowerCase(),
        );
        const allowedNames = new Set(
            this.config.ALLOWED_NAMES.map((n) => n.toLowerCase()),
        );

        lines.forEach((line, idx) => {
            const words = line.match(/\b[\w']+\b/g) || [];
            words.forEach((word) => {
                if (word.length < 3 || word.startsWith("_")) return;
                const lw = word.toLowerCase();
                if (allowedNames.has(lw)) return;
                correctNames.forEach((cn, i) => {
                    if (
                        lw !== cn &&
                        Utils.levenshtein(lw, cn) <=
                            this.config.NAME_LEVENSHTEIN_THRESHOLD
                    ) {
                        issues.push({
                            file: filePath,
                            line: idx + 1,
                            type: "warning",
                            category: this.getCategory(),
                            message: `Possible misspelling of "${this.config.CORRECT_NAMES[i]}"`,
                            severity: 1,
                            context: Utils.highlightText(
                                line,
                                new RegExp(`\\b${word}\\b`, "g"),
                            ),
                            suggestion: this.config.CORRECT_NAMES[i],
                        });
                    }
                });
            });
        });
        return issues;
    }

    getCategory(): string {
        return "Name Spelling";
    }
}

// Repetitive word checker
export class RepetitionChecker extends BaseChecker {
    async check(content: string, filePath: string): Promise<Issue[]> {
        const issues: Issue[] = [];
        const lines = content.split("\n");
        const stopWords = new Set(this.config.STOP_WORDS);

        lines.forEach((line, index) => {
            const words = line.toLowerCase().match(/\b[\w']+\b/g) || [];
            const wordCounts: { [key: string]: number } = {};

            words.forEach((word) => {
                if (
                    word.length >= this.config.REPETITION_MIN_WORD_LENGTH &&
                    !stopWords.has(word)
                ) {
                    wordCounts[word] = (wordCounts[word] || 0) + 1;
                }
            });

            Object.entries(wordCounts).forEach(([word, count]) => {
                if (count > 1) {
                    issues.push({
                        file: filePath,
                        line: index + 1,
                        type: "info",
                        category: this.getCategory(),
                        message: `Word "${word}" repeated ${count} times`,
                        severity: 0,
                        context: Utils.highlightText(
                            line,
                            new RegExp(`\\b${word}\\b`, "gi"),
                        ),
                    });
                }
            });
        });

        return issues;
    }

    getCategory(): string {
        return "Repetition";
    }
}

// Filler word checker
export class FillerWordChecker extends BaseChecker {
    async check(content: string, filePath: string): Promise<Issue[]> {
        const issues: Issue[] = [];
        const lines = content.split("\n");

        lines.forEach((line, index) => {
            this.config.FILLER_WORDS.forEach((fillerWord: string) => {
                const regex = new RegExp(`\\b${fillerWord}\\b`, "gi");
                if (regex.test(line)) {
                    issues.push({
                        file: filePath,
                        line: index + 1,
                        type: "info",
                        category: this.getCategory(),
                        message: `Consider removing filler word "${fillerWord}"`,
                        severity: 0,
                        context: Utils.highlightText(line, regex),
                    });
                }
            });
        });

        return issues;
    }

    getCategory(): string {
        return "Style";
    }
}
