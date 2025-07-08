import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { validateRecapContent } from "./recapChecks.js";

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
const baseDir = join(process.cwd(), "recap-data", `chapter${chapterOut}`);
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
type SectionIssues = Record<string, string[]>;
type DayIssues = Record<string, SectionIssues>;
const allIssues: Record<string, DayIssues> = {};

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

    const nodesFolder = join(dayPath, "nodes");
    const validNodeBaseIds = new Set<string>();
    if (existsSync(nodesFolder)) {
        for (const f of readdirSync(nodesFolder).filter((f) =>
            f.endsWith(".md"),
        )) {
            const base = f.replace(/\.md$/, "");
            validNodeBaseIds.add(base.replace(new RegExp(`${suffix}$`), ""));
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
                // Empty edge refs
                if (/\[[^\]]*\]\(#edge:\s*\)/.test(content)) {
                    issues.push("empty #edge: reference (no ID provided)");
                }

                // Non‑existent edge IDs in this day’s edges folder
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

                // Empty node refs
                if (/\[[^\]]*\]\(#node:\s*\)/.test(content)) {
                    issues.push("empty #node: reference (no ID provided)");
                }

                // Non‑existent node IDs
                const NODE_REF_RE = /\[[^\]]+\]\(#node:([^)]+)\)/g;
                while ((m = NODE_REF_RE.exec(content))) {
                    const id = m[1].trim();
                    if (id && !validNodeBaseIds.has(id)) {
                        issues.push(
                            `#node ID "${id}" not found in nodes/day${dayIndex + 1}`,
                        );
                    }
                }

                // Check for potential missing #embed tags
                const lines = content.split(/\r?\n/);
                for (let i = 1; i < lines.length - 1; i++) {
                    const prev = lines[i - 1].trim();
                    const curr = lines[i].trim();
                    const next = lines[i + 1].trim();

                    // a line that's exactly a standalone Markdown link
                    const m = curr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (m && prev === "" && next === "") {
                        const url = m[2].trim();

                        // 1) Already an embed → ignore
                        if (url.startsWith("#embed:")) continue;

                        // 2) Any other hash‐tag link (#node:, #edge:, #easter:, etc.) → ignore
                        if (/^#\w+:/.test(url)) continue;

                        // 3) Twitter / X links → ignore
                        if (/^https?:\/\/(www\.)?(twitter|x)\.com\//.test(url))
                            continue;

                        // Otherwise, warn about a standalone link that probably needs #embed
                        issues.push(
                            `potential missing #embed tag around standalone link ${curr}`,
                        );
                    }
                }
            }

            // Title check for edges only
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
