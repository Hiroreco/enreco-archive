import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { validateRecapContent } from "./recapChecks";

const __dirname = dirname(fileURLToPath(import.meta.url));

const chapterArg = process.argv[2];
if (!chapterArg) {
    console.error("Usage: pnpm run validate-recaps <chapter-number>");
    process.exit(1);
}
const chapterNum = Number(chapterArg);
if (isNaN(chapterNum) || chapterNum < 0) {
    console.error("Chapter number must be a non-negative integer");
    process.exit(1);
}

const chapterOut = chapterNum + 1;
const baseDir = join(__dirname, "../recap-data", `chapter${chapterOut}`);
if (!existsSync(baseDir)) {
    console.error(`Directory not found: ${baseDir}`);
    process.exit(1);
}

// Find all day subfolders (day1, day2, …)
const dayDirs = readdirSync(baseDir).filter(
    (name) =>
        existsSync(join(baseDir, name)) &&
        statSync(join(baseDir, name)).isDirectory(),
);

if (dayDirs.length === 0) {
    console.warn(`No day folders under ${baseDir}`);
    process.exit(0);
}

// Prepare to collect issues
type SectionIssues = Record<string, string[]>; // filename → errors[]
type DayIssues = Record<string, SectionIssues>; // section → SectionIssues
const allIssues: Record<string, DayIssues> = {};

for (const dayName of dayDirs) {
    const dayPath = join(baseDir, dayName);

    for (const section of ["recaps", "nodes", "edges"] as const) {
        const secPath = join(dayPath, section);
        if (!existsSync(secPath)) continue; // skip if missing

        const files = readdirSync(secPath).filter(
            (f) => f.endsWith(".md") || f.endsWith(".txt"),
        );

        for (const filename of files) {
            const fullPath = join(secPath, filename);
            const content = readFileSync(fullPath, "utf-8");

            const issues = validateRecapContent(content);

            //  if it's an edge, also require a <!-- title: ... --> on line 1
            if (section === "edges") {
                const firstLine = content.split(/\r?\n/)[0]?.trim() || "";
                if (!/^<!--\s*title:\s*.+\s*-->$/.test(firstLine)) {
                    issues.push(
                        "missing or malformed edge title comment (should be <!-- title: Your Title --> on line 1)",
                    );
                }
            }

            if (issues.length) {
                allIssues[dayName] ??= {};
                allIssues[dayName][section] ??= {};
                allIssues[dayName][section][filename] = issues;
            }
        }
    }
}

if (!Object.keys(allIssues).length) {
    console.log("✅ All recaps, nodes, and edges passed validation");
    process.exit(0);
}

console.warn("⚠️  Validation errors detected:");
for (const [dayName, daySections] of Object.entries(allIssues)) {
    console.warn(`\n📂 ${dayName}:`);
    for (const [section, files] of Object.entries(daySections)) {
        console.warn(`  └─ ${section}/`);
        for (const [file, errs] of Object.entries(files)) {
            console.warn(`      • ${file}:`);
            errs.forEach((e) => console.warn(`          - ${e}`));
        }
    }
}

process.exit(1);
