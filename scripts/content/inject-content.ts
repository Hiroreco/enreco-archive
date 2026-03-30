import { execSync } from "child_process";

function runScript(cmd: string, locale: string) {
    try {
        execSync(`${cmd} ${locale}`, { stdio: "inherit" });
    } catch (err) {
        process.exit(1);
    }
}

function main() {
    const localeArg = process.argv[2];
    const locales = localeArg ? [localeArg] : ["en", "ja"];

    console.log("🔄 Renaming edge files...");
    runScript("pnpm rename-edge-files", "");

    for (const locale of locales) {
        console.log(`\n🌐 Injecting content for locale: ${locale}`);

        console.log(`📝 Injecting texts (${locale})...`);
        runScript("pnpm inject-texts", locale);

        console.log(`📝 Injecting glossary (${locale})...`);
        runScript("pnpm inject-glossary", locale);

        console.log(`🔎 Running validate-content (${locale})...`);
        runScript("pnpm validate-content", locale);

        console.log(`📝 Injecting recaps (${locale})...`);
        runScript("pnpm inject-recaps", locale);

        console.log(`📝 Injecting chapter recaps (${locale})...`);
        runScript("pnpm inject-chapter-recaps", locale);

        console.log(`📝 Injecting media archive (${locale})...`);
        runScript("pnpm inject-media-archive", locale);

        console.log(`✅ All content injected successfully for locale: ${locale}!`);
    }
}

main();
