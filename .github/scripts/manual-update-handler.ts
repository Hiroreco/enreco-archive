import {
    countChecklistItems,
    createOctokit,
    extractChapterDay,
    extractItemName,
    extractItemStates,
    extractProofreaderAssignments,
    extractWriterAssignments,
    getDiscordMappings,
    getEnvVar,
    getIssue,
    getRepoInfo,
    getStoredState,
    ManualUpdate,
    postIssueComment,
    sendDiscordNotification,
    storeState,
} from "../utils/shared-utils";

function detectManualUpdates(
    oldBody: string,
    newBody: string,
    issueTitle: string
): ManualUpdate[] {
    const manualUpdates: ManualUpdate[] = [];
    const chapterDay = extractChapterDay(issueTitle);
    if (!chapterDay) return manualUpdates;

    const { chapter, day } = chapterDay;

    // Extract item states from both versions
    const oldItemStates = extractItemStates(oldBody);
    const newItemStates = extractItemStates(newBody);

    // Compare states by item name
    for (const [itemName, newState] of Object.entries(newItemStates)) {
        const oldState = oldItemStates[itemName];

        // Detect items that changed from unchecked to checked
        if (oldState === "unchecked" && newState === "checked") {
            const updateType = itemName === "chart" ? "chart" : "written";
            manualUpdates.push({
                item: itemName,
                chapter,
                day,
                type: updateType,
            });
            console.log(
                `Detected manual update: ${itemName} (${updateType}) for Chapter ${chapter}, Day ${day}`
            );
        }
    }

    return manualUpdates;
}

function detectInitialCheckedItems(
    issueBody: string,
    issueTitle: string
): ManualUpdate[] {
    const initialUpdates: ManualUpdate[] = [];
    const chapterDay = extractChapterDay(issueTitle);
    if (!chapterDay) return initialUpdates;

    const { chapter, day } = chapterDay;
    const lines = issueBody.split("\n");

    for (const line of lines) {
        if (line.includes("- [x]")) {
            const itemName = extractItemName(line);
            if (itemName) {
                const updateType = itemName === "chart" ? "chart" : "written";
                initialUpdates.push({
                    item: itemName,
                    chapter,
                    day,
                    type: updateType,
                });
                console.log(
                    `Found pre-existing checked item: ${itemName} (${updateType}) for Chapter ${chapter}, Day ${day}`
                );
            }
        }
    }

    return initialUpdates;
}

function buildManualUpdatePingMessage(
    updates: ManualUpdate[],
    progressInfo: { completed: number; total: number },
    issueBody: string
): string {
    const chartUpdates = updates.filter((u) => u.type === "chart");
    const writtenUpdates = updates.filter((u) => u.type === "written");
    const discordMappings = getDiscordMappings();
    console.log(discordMappings);

    const chartPings = chartUpdates.map(
        (c) => `**C${c.chapter}D${c.day}** 📈 New chart has been drawn.`
    );

    // Extract writer and proofreader assignments for proofread updates
    const writerAssignments = extractWriterAssignments(issueBody);
    const proofreaderAssignments = extractProofreaderAssignments(issueBody);

    console.log("Writer assignments:", writerAssignments);
    console.log("Proofreader assignments:", proofreaderAssignments);

    const proofreadPings = writtenUpdates.map((p) => {
        const assignedWriter = writerAssignments[p.item];
        const assignedProofreader = proofreaderAssignments[assignedWriter];
        const discordId =
            discordMappings[assignedProofreader] || assignedProofreader;

        console.log("Assigned writer:", assignedWriter);
        console.log("Assigned proofreader:", assignedProofreader);

        return `**C${p.chapter}D${p.day}** 📝 **${p.item}** (${assignedWriter}) has been written on HackMD, pinging <@${discordId}>`;
    });

    if (
        writtenUpdates.length > 0 &&
        progressInfo.completed === progressInfo.total
    ) {
        proofreadPings.push("🎉 All entries written!");
    }

    return [...chartPings, ...proofreadPings].join("\n");
}

function buildManualUpdateComment(updates: ManualUpdate[]): string {
    const chartUpdates = updates.filter((u) => u.type === "chart");
    const writtenUpdates = updates.filter((u) => u.type === "written");
    const parts: string[] = [];

    if (chartUpdates.length) {
        parts.push(
            `Chart updates - ${chartUpdates
                .map((c) => `Chapter ${c.chapter}, Day ${c.day}`)
                .join(", ")}`
        );
    }

    if (writtenUpdates.length) {
        parts.push(
            `Written complete - ${writtenUpdates
                .map((p) => `${p.item} (Chapter ${p.chapter}, Day ${p.day})`)
                .join(", ")}`
        );
    }

    return `🤖 Manual checklist update: ${parts.join("; ")}`;
}

async function processManualUpdates(): Promise<void> {
    const octokit = createOctokit();
    const { owner, repo } = getRepoInfo();
    const issueNumber = parseInt(getEnvVar("GITHUB_ISSUE_NUMBER", "0"));

    if (!issueNumber) {
        console.log("No issue number provided");
        return;
    }

    try {
        const issue = await getIssue(octokit, owner, repo, issueNumber);

        // Check if this is a daily checklist issue
        if (
            !issue.labels.some((label: any) => label.name === "daily-checklist")
        ) {
            console.log("Not a daily checklist issue, skipping");
            return;
        }

        console.log(
            `Processing manual updates for issue #${issueNumber}: ${issue.title}`
        );

        // Get previous issue state
        const previousBody = await getStoredState<string>(
            octokit,
            owner,
            repo,
            issueNumber,
            "CHECKLIST_TRACKER"
        );
        let manualUpdates: ManualUpdate[] = [];

        if (!previousBody) {
            console.log("No previous state found, getting current state");
            manualUpdates = detectInitialCheckedItems(
                issue.body || "",
                issue.title
            );
        } else {
            manualUpdates = detectManualUpdates(
                previousBody,
                issue.body || "",
                issue.title
            );
        }

        if (manualUpdates.length > 0) {
            console.log(
                `Found ${manualUpdates.length} manual updates:`,
                manualUpdates
            );

            // Get current progress for the issue
            const progressInfo = countChecklistItems(
                issue.body || "",
                "proofread"
            );

            // Send Discord notification
            const pingMessage = buildManualUpdatePingMessage(
                manualUpdates,
                progressInfo,
                issue.body || ""
            );
            await sendDiscordNotification(pingMessage);

            // Post comment on the issue
            const commentMessage = buildManualUpdateComment(manualUpdates);
            await postIssueComment(
                octokit,
                owner,
                repo,
                issueNumber,
                commentMessage
            );
        } else {
            console.log("No manual checkbox updates detected");
        }

        // Store current state for next comparison
        await storeState(
            octokit,
            owner,
            repo,
            issueNumber,
            issue.body || "",
            "CHECKLIST_TRACKER"
        );
    } catch (error) {
        console.error("Error processing manual updates:", error);
    }
}

// Main execution
if (require.main === module) {
    processManualUpdates().catch(console.error);
}
