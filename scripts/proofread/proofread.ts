import * as fs from "fs/promises";
import * as path from "path";
import { CONFIG } from "./config.js";
import { Issue } from "./types.js";
import {
    BaseChecker,
    TextLintChecker,
    NameChecker,
    RepetitionChecker,
    FillerWordChecker,
} from "./checkers.js";

// Main proofreading engine
class ProofreadingEngine {
    private checkers: BaseChecker[] = [];
    private config: typeof CONFIG;

    constructor(config: typeof CONFIG) {
        this.config = config;
        this.initializeCheckers();
    }

    private initializeCheckers(): void {
        if (this.config.ENABLE_TEXTLINT) {
            this.checkers.push(new TextLintChecker(this.config));
        }

        if (this.config.ENABLE_CUSTOM_CHECKS) {
            // this.checkers.push(new NameChecker(this.config));
            // this.checkers.push(new RepetitionChecker(this.config));
            // this.checkers.push(new FillerWordChecker(this.config));
        }
    }

    async processFile(filePath: string): Promise<Issue[]> {
        const content = await fs.readFile(filePath, "utf-8");
        const allIssues: Issue[] = [];

        for (const checker of this.checkers) {
            const issues = await checker.check(content, filePath);
            allIssues.push(...issues);
        }

        return allIssues.sort((a, b) => a.line - b.line);
    }

    async processDirectory(directory: string): Promise<Issue[]> {
        const files = await this.getMarkdownFiles(directory);
        const allIssues: Issue[] = [];

        for (const file of files) {
            console.log(`Processing: ${file}`);
            const issues = await this.processFile(file);
            allIssues.push(...issues);
        }

        return allIssues;
    }

    private async getMarkdownFiles(dir: string): Promise<string[]> {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const results = await Promise.all(
            entries.map(async (entry) => {
                const fullPath = path.join(dir, entry.name);

                if (
                    this.config.IGNORE_TEXTS_FOLDER &&
                    fullPath.split(path.sep).includes("texts")
                ) {
                    return [];
                }

                if (entry.isDirectory()) {
                    return this.getMarkdownFiles(fullPath);
                }

                return this.config.CONTENT_FILE_EXTENSIONS.test(entry.name)
                    ? [fullPath]
                    : [];
            }),
        );

        return results.flat();
    }
}

// Report generator
class ReportGenerator {
    static generateMarkdownReport(
        issues: Issue[],
        outputPath: string,
    ): Promise<void> {
        const groupedIssues = this.groupIssuesByFile(issues);
        const markdown = this.buildMarkdownContent(groupedIssues);
        return fs.writeFile(outputPath, markdown, "utf-8");
    }

    private static groupIssuesByFile(issues: Issue[]): Map<string, Issue[]> {
        const grouped = new Map<string, Issue[]>();

        issues.forEach((issue) => {
            const relativePath = path.relative(process.cwd(), issue.file);
            if (!grouped.has(relativePath)) {
                grouped.set(relativePath, []);
            }
            grouped.get(relativePath)!.push(issue);
        });

        return grouped;
    }

    private static buildMarkdownContent(
        groupedIssues: Map<string, Issue[]>,
    ): string {
        const totalIssues = Array.from(groupedIssues.values()).reduce(
            (sum, issues) => sum + issues.length,
            0,
        );

        let markdown = `# Proofreading Report\n\n`;
        markdown += `**Generated:** ${new Date().toISOString()}\n`;
        markdown += `**Total Issues:** ${totalIssues}\n`;

        if (totalIssues === 0) {
            markdown += "✨ No issues found! Your writing looks great.\n";
            return markdown;
        }

        markdown += `## Summary\n\n`;
        const categorySummary = this.getCategorySummary(groupedIssues);
        Object.entries(categorySummary).forEach(([category, count]) => {
            markdown += `- **${category}:** ${count} issues\n`;
        });
        markdown += "\n";

        // Generate file-by-file report
        for (const [filePath, issues] of groupedIssues) {
            markdown += `## 📄 [${filePath}](..\\..\\${filePath})\n\n`;

            issues.forEach((issue, index) => {
                const severity = this.getSeverityIcon(issue.type);
                const lineInfo = issue.column
                    ? `${issue.line}:${issue.column}`
                    : `${issue.line}`;

                markdown += `### ${severity} [Line ${lineInfo}](..\\..\\${filePath}#L${issue.line}) - ${issue.category}\n\n`;
                markdown += `**Issue:** ${issue.message}\n\n`;

                if (issue.suggestion) {
                    markdown += `**Suggestion:** ${issue.suggestion}\n\n`;
                }

                if (issue.context) {
                    markdown += `**Context:** \`${issue.context}\`\n\n`;
                }

                if (issue.ruleId) {
                    markdown += `**Rule:** ${issue.ruleId}\n\n`;
                }

                markdown += "---\n\n";
            });
        }

        return markdown;
    }

    private static getCategorySummary(groupedIssues: Map<string, Issue[]>): {
        [category: string]: number;
    } {
        const summary: { [category: string]: number } = {};

        for (const issues of groupedIssues.values()) {
            issues.forEach((issue) => {
                summary[issue.category] = (summary[issue.category] || 0) + 1;
            });
        }

        return summary;
    }

    private static getSeverityIcon(type: string): string {
        switch (type) {
            case "error":
                return "❌";
            case "warning":
                return "⚠️";
            case "info":
                return "ℹ️";
            default:
                return "📝";
        }
    }
}

async function main() {
    const dir = process.argv[2];
    if (!dir) {
        console.error("Usage: pnpm proofread <directory>");
        process.exit(1);
    }
    console.log("🔍 Starting...");
    const engine = new ProofreadingEngine(CONFIG);
    const issues = await engine.processDirectory(dir);
    console.log(`📊 Found ${issues.length} issues`);
    await ReportGenerator.generateMarkdownReport(
        issues,
        CONFIG.OUTPUT_FILENAME,
    );
    console.log(`✅ Done.`);
}

// Run unconditionally in ESM
main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});

export { ProofreadingEngine, ReportGenerator };
