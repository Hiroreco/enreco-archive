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

// scripts/validateRecaps.ts
// … your existing imports …

for (const dayName of dayDirs) {
    const dayPath = join(baseDir, dayName);
    const dayIndex = Number(dayName.replace(/^day/, "")) - 1;
    const suffix = `-c${chapterNum + 1}d${dayIndex + 1}`;

    // 1) Build base‐ID set for this day’s edges
    const edgesFolder = join(dayPath, "edges");
    const validEdgeBaseIds = new Set<string>();
    if (existsSync(edgesFolder)) {
        for (const f of readdirSync(edgesFolder).filter((f) =>
            f.endsWith(".md"),
        )) {
            const nameWithoutExt = f.replace(/\.md$/, "");
            // strip the suffix to get the base ID
            const baseId = nameWithoutExt.replace(new RegExp(`${suffix}$`), "");
            validEdgeBaseIds.add(baseId);
        }
    }

    for (const section of ["recaps", "nodes", "edges"] as const) {
        const secPath = join(dayPath, section);
        if (!existsSync(secPath)) continue;
        const files = readdirSync(secPath).filter((f) => f.endsWith(".md"));

        for (const filename of files) {
            const content = readFileSync(join(secPath, filename), "utf-8");
            const issues = validateRecapContent(content);

            // Only in nodes & edges sections
            if (section === "nodes" || section === "edges") {
                // 1) Empty edge refs
                if (/\[[^\]]*\]\(#edge:\s*\)/.test(content)) {
                    issues.push("empty #edge: reference (no ID provided)");
                }

                // 2) Non‑existent edge IDs in this day’s edges folder
                const EDGE_REF_RE = /\[[^\]]+\]\(#edge:([^)]+)\)/g;
                let m: RegExpExecArray | null;
                while ((m = EDGE_REF_RE.exec(content))) {
                    const id = m[1].trim();
                    if (id && !validEdgeBaseIds.has(id)) {
                        issues.push(
                            `#edge ID "${id}" not found in edges/day${dayIndex + 1}`,
                        );
                    }
                }
            }

            // 3) Title check for edges only
            if (section === "edges") {
                const firstLine = content.split(/\r?\n/)[0].trim();
                if (!/^<!--\s*title:\s*.+\s*-->$/.test(firstLine)) {
                    issues.push(
                        "missing or malformed edge title comment (should be <!-- title: Your Title --> on line 1)",
                    );
                }
            }

            if (issues.length) {
                allIssues[dayName] ??= {};
                allIssues[dayName][section] ??= {};
                allIssues[dayName][section]![filename] = issues;
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
