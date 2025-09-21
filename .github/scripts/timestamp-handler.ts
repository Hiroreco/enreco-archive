import {
    createOctokit,
    extractChapterDay,
    extractWriterAssignments,
    getDiscordMappings,
    getEnvVar,
    getIssue,
    getRepoInfo,
    getStoredState,
    sendDiscordNotification,
    storeState,
    TimestampUpdate,
} from "../utils/shared-utils";

function extractCurrentTimestamps(issueBody: string): Record<string, string> {
    const timestamps: Record<string, string> = {};
    // Look for the timestamps section - make emoji optional
    const timestampSectionMatch = issueBody.match(
        /##\s*(?:📋\s*)?Timestamps([\s\S]*?)(?=\n##|$)/i
    );
    if (!timestampSectionMatch) return timestamps;
    const timestampSection = timestampSectionMatch[1];
    // Match lines like: - gigi [link](https://...)
    const timestampRegex = /^\s*-\s*([^\s\[]+)\s*\[link\]\(([^)]+)\)/gm;
    let match;
    while ((match = timestampRegex.exec(timestampSection)) !== null) {
        const pov = match[1].trim();
        const link = match[2].trim();
        timestamps[pov] = link;
    }
    return timestamps;
}

function buildTimestampPingMessage(updates: TimestampUpdate[]): string {
    return updates
        .map(
            (update) =>
                `**\[C${update.chapter}D${update.day}\]** ⏱️ **${update.pov}** timestamps ready [here](<${update.link}>). Pinging Archiver <@${update.discordId}>`
        )
        .join("\n");
}

async function processTimestampUpdates(): Promise<void> {
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
            console.log("Not a daily checklist issue");
            return;
        }

        console.log(
            `Processing timestamp updates for issue #${issueNumber}: ${issue.title}`
        );

        // Get previous timestamps
        const previousTimestamps =
            (await getStoredState<Record<string, string>>(
                octokit,
                owner,
                repo,
                issueNumber,
                "TIMESTAMP_TRACKER"
            )) || {};

        console.log("Previous timestamps:", previousTimestamps);

        // Get current timestamps
        const currentTimestamps = extractCurrentTimestamps(issue.body || "");
        console.log("Current timestamps:", currentTimestamps);

        // Find only new or changed timestamps
        const changedTimestamps: Record<string, string> = {};
        for (const [pov, link] of Object.entries(currentTimestamps)) {
            if (!previousTimestamps[pov] || previousTimestamps[pov] !== link) {
                changedTimestamps[pov] = link;
            }
        }

        if (Object.keys(changedTimestamps).length === 0) {
            console.log("No timestamp changes detected");
            await storeState(
                octokit,
                owner,
                repo,
                issueNumber,
                currentTimestamps,
                "TIMESTAMP_TRACKER"
            );
            return;
        }

        const writerAssignments = extractWriterAssignments(issue.body || "");
        const discordMappings = getDiscordMappings();
        console.log(discordMappings);
        const chapterDay = extractChapterDay(issue.title || "") || {
            chapter: "",
            day: "",
        };
        console.log(writerAssignments);

        // Build update notifications
        const updates: TimestampUpdate[] = [];
        for (const [pov, link] of Object.entries(changedTimestamps)) {
            const writer = writerAssignments[pov];
            updates.push({
                pov,
                writer,
                link,
                discordId: discordMappings[writer] || writer,
                chapter: chapterDay.chapter,
                day: chapterDay.day,
            });
        }

        if (updates.length > 0) {
            console.log(`Found ${updates.length} timestamp updates:`, updates);

            // Send Discord notification
            const pingMessage = buildTimestampPingMessage(updates);
            await sendDiscordNotification(pingMessage);
        }

        // Store current timestamps for next comparison
        await storeState(
            octokit,
            owner,
            repo,
            issueNumber,
            currentTimestamps,
            "TIMESTAMP_TRACKER"
        );
    } catch (error) {
        console.error("Error processing timestamp updates:", error);
    }
}

// Main execution
if (require.main === module) {
    processTimestampUpdates().catch(console.error);
}
