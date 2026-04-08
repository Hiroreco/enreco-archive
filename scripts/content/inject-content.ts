import { execSync } from "child_process";

function runScript(cmd: string, locale?: string) {
    try {
        const fullCmd = locale ? `${cmd} ${locale}` : cmd;
        execSync(fullCmd, { stdio: "inherit" });
    } catch (err) {
        process.exit(1);
    }
}

function main() {
    const localeArg = process.argv[2];
    const LOCALES = localeArg ? [localeArg] : ["en", "ja"];
    
    console.log(`🌐 Injecting content for locales: ${LOCALES.join(", ")}`);

    console.log("🔄 Renaming edge files...");
    runScript("pnpm rename-edge-files");

    console.log("📝 Injecting texts (bilingual)...");
    runScript("pnpm inject-texts");

    console.log("📝 Injecting glossary (bilingual)...");
    runScript("pnpm inject-glossary");

    console.log("📝 Injecting recaps (bilingual)...");
    runScript("pnpm inject-recaps");

    console.log("📝 Injecting chapter recaps (bilingual)...");
    runScript("pnpm inject-chapter-recaps");

    console.log("📝 Injecting media archive (bilingual)...");
    runScript("pnpm inject-media-archive");

    // Run locale-specific validation for each locale
    for (const locale of LOCALES) {
        console.log(`\n🔎 Running validate-content (${locale})...`);
        runScript("pnpm validate-content", locale);
    }

    console.log(`\n✅ All content injected successfully for locales: ${LOCALES.join(", ")}!`);
}

main();
