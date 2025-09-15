import { Octokit } from "@octokit/rest";

// Types
export interface FileInfo {
    item: string;
    chapter: string;
    day: string;
}

export interface ProcessedFile {
    file: string;
    submitter: string;
    chapter: string;
    day: string;
    status: "added" | "modified" | "changed";
    discordId?: string;
    item: string;
}

export interface ManualUpdate {
    item: string;
    chapter: string;
    day: string;
    type: "chart" | "written";
}

export interface TimestampUpdate {
    pov: string;
    writer: string;
    link: string;
    discordId: string;
    chapter: string;
    day: string;
}

export interface DiscordEmbed {
    title: string;
    description: string;
    color: number;
    fields: Array<{ name: string; value: string; inline: boolean }>;
    footer?: { text: string };
    timestamp: string;
}

// Environment utilities
export function getEnvVar(name: string, defaultValue = ""): string {
    return process.env[name] || defaultValue;
}

export function getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} environment variable is required`);
    }
    return value;
}

export function getDiscordMappings(): Record<string, string> {
    return JSON.parse(getEnvVar("DISCORD_USER_MAPPINGS", "{}"));
}

// File utilities
export function escapeRegex(str: string): string {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

export function parseFileInfo(file: string): FileInfo | null {
    const base = file.replace(/\.md$/, "").split("/").pop() || "";
    const match = base.match(/^(.+)-c(\d+)d(\d+)$/);
    if (!match) return null;

    return {
        item: match[1],
        chapter: match[2],
        day: match[3],
    };
}

export function getChangedFiles(type: "all" | "added" | "modified"): string[] {
    const envVar =
        type === "all"
            ? "CHANGED_FILES"
            : type === "added"
            ? "ADDED_FILES"
            : "MODIFIED_FILES";

    return getEnvVar(envVar)
        .split(" ")
        .filter((f) => f.endsWith(".md") && f.trim());
}

// GitHub utilities
export function createOctokit(): Octokit {
    return new Octokit({ auth: getRequiredEnvVar("GITHUB_TOKEN") });
}

export function getRepoInfo() {
    return {
        owner: getRequiredEnvVar("REPO_OWNER"),
        repo: getRequiredEnvVar("REPO_NAME"),
    };
}

// Issue utilities
export async function getChecklistIssues(
    octokit: Octokit,
    owner: string,
    repo: string
) {
    const issues = await octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
        labels: "daily-checklist",
    });
    return issues.data;
}

export function countChecklistItems(
    issueBody: string,
    type: "submitted" | "proofread"
): {
    total: number;
    completed: number;
} {
    const thingToCheckfor = type === "submitted" ? "~~" : "- [x]";
    const lines = issueBody.split("\n");
    let total = 0;
    let completed = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith("- [")) continue;
        if (trimmedLine.includes("chart")) continue;

        total++;
        if (trimmedLine.includes(thingToCheckfor)) {
            completed++;
        }
    }

    return { total, completed };
}

export async function getIssue(
    octokit: Octokit,
    owner: string,
    repo: string,
    issueNumber: number
) {
    const { data: issue } = await octokit.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
    });
    return issue;
}

export function extractChapterDay(
    issueTitle: string
): { chapter: string; day: string } | null {
    const match = issueTitle.match(/Chapter (\d+), Day (\d+)/);
    if (!match) return null;

    return {
        chapter: match[1],
        day: match[2],
    };
}

export function extractWriterAssignments(
    issueBody: string
): Record<string, string> {
    const assignments: Record<string, string> = {};
    const lines = issueBody.split("\n");

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || !trimmedLine.startsWith("- [")) continue;

        const parenIndex = trimmedLine.indexOf("(");
        const closeParenIndex = trimmedLine.indexOf(")", parenIndex);
        if (parenIndex === -1 || closeParenIndex === -1) continue;

        const writer = trimmedLine
            .substring(parenIndex + 1, closeParenIndex)
            .trim();
        let afterCheckbox = trimmedLine.replace(/^- \[[x\s]\]\s*/, "");
        afterCheckbox = afterCheckbox.replace(/^~~(.+?)~~/, "$1");
        const beforeParen = afterCheckbox
            .substring(0, afterCheckbox.indexOf("("))
            .trim();

        if (beforeParen && writer) {
            assignments[beforeParen] = writer;
        }
    }

    return assignments;
}

export function extractItemName(checklistLine: string): string | null {
    let afterCheckbox = checklistLine.replace(/^- \[[x\s]\]\s*/, "");
    afterCheckbox = afterCheckbox.replace(/^~~(.+?)~~/, "$1");

    const parenIndex = afterCheckbox.indexOf("(");
    if (parenIndex === -1) return afterCheckbox.trim();

    return afterCheckbox.substring(0, parenIndex).trim();
}

export function crossOffItem(issueBody: string, item: string): string {
    const escapedItem = escapeRegex(item);

    // Try unchecked items first
    let pattern = new RegExp(
        `^(\\s*- \\[ \\] )(${escapedItem})((?:\\s*\\([^)]+\\))?)\\s*$`,
        "gm"
    );

    let result = issueBody.replace(pattern, `$1~~${item}~~$3`);

    // If no replacement happened, try checked items
    if (result === issueBody) {
        pattern = new RegExp(
            `^(\\s*- \\[x\\] )(${escapedItem})((?:\\s*\\([^)]+\\))?)\\s*$`,
            "gm"
        );
        result = issueBody.replace(pattern, `$1~~${item}~~$3`);
    }

    return result;
}

// State tracking utilities
export async function getStoredState<T>(
    octokit: Octokit,
    owner: string,
    repo: string,
    issueNumber: number,
    stateType: "CHECKLIST_TRACKER" | "TIMESTAMP_TRACKER"
): Promise<T | null> {
    try {
        const { data: comments } = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: issueNumber,
            per_page: 100,
        });

        const botComment = comments.find(
            (comment: any) =>
                comment.body.includes(`<!-- ${stateType}:`) &&
                comment.user.type === "Bot"
        );

        if (botComment && typeof botComment.body === "string") {
            const match = botComment.body.match(
                new RegExp(`<!-- ${stateType}: (.+) -->`)
            );
            if (match) {
                if (stateType === "CHECKLIST_TRACKER") {
                    return Buffer.from(match[1], "base64").toString(
                        "utf-8"
                    ) as T;
                } else {
                    return JSON.parse(match[1]) as T;
                }
            }
        }

        return null;
    } catch (error) {
        console.error(`Error getting stored ${stateType} state:`, error);
        return null;
    }
}

export async function storeState<T>(
    octokit: Octokit,
    owner: string,
    repo: string,
    issueNumber: number,
    state: T,
    stateType: "CHECKLIST_TRACKER" | "TIMESTAMP_TRACKER"
): Promise<void> {
    try {
        const encodedState =
            stateType === "CHECKLIST_TRACKER"
                ? Buffer.from(state as string).toString("base64")
                : JSON.stringify(state);

        const commentBody = `<!-- ${stateType}: ${encodedState} -->`;

        const { data: comments } = await octokit.issues.listComments({
            owner,
            repo,
            issue_number: issueNumber,
        });

        const existingComment = comments.find((comment: any) =>
            comment.body.includes(`<!-- ${stateType}:`)
        );

        if (existingComment) {
            await octokit.issues.updateComment({
                owner,
                repo,
                comment_id: existingComment.id,
                body: commentBody,
            });
        } else {
            await octokit.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body: commentBody,
            });
        }
    } catch (error) {
        console.error(`Error storing ${stateType} state:`, error);
    }
}

// Discord notification utilities
export async function sendDiscordNotification(
    pingMessage?: string,
    embed?: DiscordEmbed
): Promise<void> {
    const webhookUrl = getEnvVar("DISCORD_WEBHOOK_URL");
    if (!webhookUrl) {
        console.log("No Discord webhook URL provided");
        return;
    }

    const payload: any = {};
    if (embed) {
        payload.embeds = [embed];
    }
    if (pingMessage) {
        payload.content = pingMessage;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(
                "Failed to send Discord notification:",
                response.statusText
            );
        } else {
            console.log("Discord notification sent successfully!");
        }
    } catch (error) {
        console.error("Error sending Discord notification:", error);
    }
}

// Issue comment utilities
export async function postIssueComment(
    octokit: Octokit,
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
): Promise<void> {
    try {
        await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body,
        });
    } catch (error) {
        console.error("Error posting issue comment:", error);
    }
}

export async function updateIssueBody(
    octokit: Octokit,
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
): Promise<void> {
    try {
        await octokit.issues.update({
            owner,
            repo,
            issue_number: issueNumber,
            body,
        });
    } catch (error) {
        console.error("Error updating issue body:", error);
    }
}

export function extractProofreaderAssignments(
    issueBody: string
): Record<string, string> {
    const assignments: Record<string, string> = {};
    const proofreaderSection = issueBody.match(
        /## Proofreaders\s*\n([\s\S]*?)(?:\n##|$)/
    );
    if (!proofreaderSection) return assignments;
    const lines = proofreaderSection[1]
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- "));
    for (const line of lines) {
        const match = line.match(/^- ([^:]+):\s*(.+)$/);
        if (!match) continue;
        const proofreader = match[1].trim();
        const names = match[2]
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean);
        for (const name of names) {
            assignments[name] = proofreader;
        }
    }
    return assignments;
}

export function extractItemStates(
    issueBody: string
): Record<string, "checked" | "unchecked" | "crossed-off"> {
    const itemStates: Record<string, "checked" | "unchecked" | "crossed-off"> =
        {};
    const lines = issueBody.split("\n");

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith("- [")) continue;

        // Skip nested items (relationship cards with indentation)
        if (
            trimmedLine.startsWith("    - [") ||
            trimmedLine.startsWith("\t- [")
        )
            continue;

        const itemName = extractItemName(trimmedLine);
        if (!itemName) continue;

        // Determine state
        if (trimmedLine.includes("- [x]")) {
            itemStates[itemName] = "checked";
        } else if (trimmedLine.includes("~~") && trimmedLine.includes("~~")) {
            itemStates[itemName] = "crossed-off";
        } else if (trimmedLine.includes("- [ ]")) {
            itemStates[itemName] = "unchecked";
        }
    }

    return itemStates;
}
