import * as readline from "readline";

// Utility functions
export class Utils {
    static promptUser(query: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) =>
            rl.question(query, (answer) => {
                rl.close();
                resolve(answer.trim().toLowerCase());
            }),
        );
    }

    static levenshtein(a: string, b: string): number {
        const dp = Array.from({ length: a.length + 1 }, () =>
            Array(b.length + 1).fill(0),
        );
        for (let i = 0; i <= a.length; i++) dp[i][0] = i;
        for (let j = 0; j <= b.length; j++) dp[0][j] = j;

        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
                );
            }
        }
        return dp[a.length][b.length];
    }

    static isTableCell(line: string, position: number): boolean {
        const beforePipes = line.substring(0, position).split("|").length - 1;
        const afterPipes = line.substring(position).split("|").length - 1;
        return beforePipes > 0 && afterPipes > 0;
    }

    static highlightText(text: string, pattern: string | RegExp): string {
        const regex =
            typeof pattern === "string" ? new RegExp(pattern, "gi") : pattern;
        return text.replace(regex, "<$&>");
    }
}
