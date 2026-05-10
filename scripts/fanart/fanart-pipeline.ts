import { execSync } from "child_process";

function runScript(cmd: string) {
    try {
        execSync(cmd, { stdio: "inherit" });
    } catch (err) {
        process.exit(1);
    }
}

function main() {
    console.log("📝 Adding entries from fanart.md");
    runScript("pnpm add-fanart");

    console.log("📝 Matching EN and JA files");
    runScript("pnpm match-fanart");

    console.log("📝 Extracting twitter links");
    runScript("pnpm extract-twitter-links");

    console.log("📝 Downloading images");
    runScript("pnpm download-images");

    console.log("📝 Optimize images");
    runScript("pnpm optimize-images");

    console.log("📝 Inject fanart");
    runScript("pnpm inject-fanart");

    console.log("📝 Copy resources");
    runScript("pnpm copy-resources");

    console.log(`\n✅ All fanart entries processed`);
}

main();
