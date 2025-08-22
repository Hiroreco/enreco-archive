import { execSync } from "child_process";

function runScript(cmd: string, locale: string) {
    try {
        execSync(`${cmd} ${locale}`, { stdio: "inherit" });
    } catch (err) {
        process.exit(1);
    }
}

function main() {
    // Get locale from arguments, default to "en"
    const locale = process.argv[2] || "en";
    console.log(`🌐 Injecting content for locale: ${locale}`);

    // 0. Rename edge files to uniform everything
    console.log("🔄 Renaming edge files...");
    runScript("pnpm rename-edge-files", "");

    // 1. Validate content first
    console.log("🔎 Running validate-content...");
    runScript("pnpm validate-content", "");

    // 2. Run all injectors with locale
    console.log(`📝 Injecting glossary (${locale})...`);
    runScript("pnpm inject-glossary", locale);

    console.log(`📝 Injecting recaps (${locale})...`);
    runScript("pnpm inject-recaps", locale);

    console.log(`📝 Injecting chapter recaps (${locale})...`);
    runScript("pnpm inject-chapter-recaps", locale);

    console.log(`📝 Injecting texts (${locale})...`);
    runScript("pnpm inject-texts", locale);

    console.log(`✅ All content injected successfully for locale: ${locale}!`);
}

main();
