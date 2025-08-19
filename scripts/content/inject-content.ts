import { execSync } from "child_process";

function runScript(cmd: string) {
    try {
        execSync(cmd, { stdio: "inherit" });
    } catch (err) {
        process.exit(1);
    }
}

function main() {
    // 0. Rename edge files to uniform everything
    console.log("🔄 Renaming edge files...");
    runScript("pnpm rename-edge-files");

    // 1. Validate content first
    console.log("🔎 Running validate-content...");
    runScript("pnpm validate-content");

    // 2. Run all injectors
    console.log("📝 Injecting glossary...");
    runScript("pnpm inject-glossary");

    console.log("📝 Injecting recaps...");
    runScript("pnpm inject-recaps");

    console.log("📝 Injecting chapter recaps...");
    runScript("pnpm inject-chapter-recaps");

    console.log("📝 Injecting texts...");
    runScript("pnpm inject-texts");

    console.log("✅ All content injected successfully!");
}

main();
