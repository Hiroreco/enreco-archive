import {
    countChecklistItems,
    createOctokit,
    crossOffItem,
    escapeRegex,
    getChangedFiles,
    getChecklistIssues,
    getEnvVar,
    getRepoInfo,
    parseFileInfo,
    postIssueComment,
    ProcessedFile,
    sendDiscordNotification,
    updateIssueBody,
} from "../utils/shared-utils";

function buildFileSubmissionPingMessage(
    processedFiles: ProcessedFile[],
    commitSha: string,
    progressInfo: { completed: number; total: number },
): string {
    let message = processedFiles
        .filter((f) => f.status === "added")
        .map(
            (f) =>
                `**C${f.chapter}D${f.day}** ✅ **${
                    f.item
                }** has been submitted by ${
                    f.submitter
                } [here](https://github.com/${getRepoInfo().owner}/${
                    getRepoInfo().repo
                }/commit/${commitSha}) (${progressInfo.completed}/${
                    progressInfo.total
                }).`,
        )
        .join("\n");

    if (progressInfo.completed === progressInfo.total) {
        message += message
            ? "\n\n🎉 All entries submitted"
            : "🎉 All entries submitted";
    }

    return message;
}

function buildFileSubmissionComment(
    processedFiles: ProcessedFile[],
    commitSha: string,
): string {
    const added = processedFiles.filter((f) => f.status === "added");
    const modified = processedFiles.filter((f) => f.status === "modified");
    const changed = processedFiles.filter((f) => f.status === "changed");
    const parts: string[] = [];

    if (added.length) {
        parts.push(
            `Submitted files - ${added
                .map((f) => `${f.file} (${f.submitter})`)
                .join(", ")}`,
        );
    }
    if (modified.length) {
        parts.push(
            `Updated files - ${modified
                .map((f) => `${f.file} (${f.submitter})`)
                .join(", ")}`,
        );
    }
    if (changed.length) {
        parts.push(
            `Changed files - ${changed
                .map((f) => `${f.file} (${f.submitter})`)
                .join(", ")}`,
        );
    }

    return `🤖 Auto-updated: ${parts.join("; ")}\nCommit: ${commitSha}`;
}

async function processFileSubmissions(): Promise<void> {
    const changedFiles = getChangedFiles("all");
    if (changedFiles.length === 0) {
        console.log("No changed .md files.");
        return;
    }

    const octokit = createOctokit();
    const { owner, repo } = getRepoInfo();
    const submitter = getEnvVar("GITHUB_ACTOR", "unknown");
    const addedFiles = getChangedFiles("added");
    const modifiedFiles = getChangedFiles("modified");

    const issues = await getChecklistIssues(octokit, owner, repo);
    const processedFiles: ProcessedFile[] = [];
    const updatedIssues: Record<number, string> = {};

    for (const file of changedFiles) {
        const info = parseFileInfo(file);
        if (!info) continue;

        const { item, chapter, day } = info;
        const issue = issues.find((issue: { title: string }) =>
            new RegExp(`Chapter ${chapter}, Day ${day}`).test(issue.title),
        );
        if (!issue) continue;

        if (!updatedIssues[issue.number]) {
            updatedIssues[issue.number] = issue.body || "";
        }

        const fileStatus = addedFiles.includes(file)
            ? "added"
            : modifiedFiles.includes(file)
              ? "modified"
              : "changed";

        console.log(`File ${file} has been ${fileStatus}`);

        if (fileStatus === "added") {
            const escapedItem = escapeRegex(item);

            // First try to cross off unchecked items
            let checkPattern = new RegExp(
                `^(\\s*- \\[ \\] )(${escapedItem})((?:\\s*\\([^)]+\\))?)\\s*$`,
                "gm",
            );

            if (checkPattern.test(updatedIssues[issue.number])) {
                updatedIssues[issue.number] = crossOffItem(
                    updatedIssues[issue.number],
                    item,
                );
                console.log(
                    `Crossed off ${item} in Chapter ${chapter}, Day ${day}`,
                );
            } else {
                // Check if item is already checked but not crossed off
                const checkedPattern = new RegExp(
                    `^(\\s*- \\[x\\] )(${escapedItem})((?:\\s*\\([^)]+\\))?)\\s*$`,
                    "gm",
                );

                if (checkedPattern.test(updatedIssues[issue.number])) {
                    updatedIssues[issue.number] = crossOffItem(
                        updatedIssues[issue.number],
                        item,
                    );
                    console.log(
                        `Crossed off already checked ${item} in Chapter ${chapter}, Day ${day}`,
                    );
                } else {
                    console.log(
                        `Could not find pattern for ${item} to cross off`,
                    );
                }
            }
        }

        processedFiles.push({
            file,
            submitter,
            status: fileStatus,
            item,
            chapter,
            day,
        });
    }

    // Update issues and send notifications
    if (processedFiles.length > 0) {
        const commitSha = getEnvVar("GITHUB_SHA", "unknown");
        const comment = buildFileSubmissionComment(processedFiles, commitSha);

        // Update GitHub issues and get progress info
        let finalProgressInfo = { completed: 0, total: 0 };

        for (const [issueNumber, body] of Object.entries(updatedIssues)) {
            await updateIssueBody(
                octokit,
                owner,
                repo,
                parseInt(issueNumber),
                body,
            );
            await postIssueComment(
                octokit,
                owner,
                repo,
                parseInt(issueNumber),
                comment,
            );

            // Get final progress for this issue (use the last one for the notification)
            finalProgressInfo = countChecklistItems(body, "submitted");
        }
        console.log(processedFiles);
        // Send Discord notification with progress
        const pingMessage = buildFileSubmissionPingMessage(
            processedFiles,
            commitSha,
            finalProgressInfo,
        );
        console.log(pingMessage);
        await sendDiscordNotification(pingMessage);
    }
}

// Main execution
if (require.main === module) {
    processFileSubmissions().catch(console.error);
}
