import fs from "fs/promises";
import path from "path";
import { EMBED_MISSING_BYPASS_LIST } from "./validation-vals.js";

// --- CONFIG ---
const RECAP_DATA_DIR = path.resolve(process.cwd(), "recap-data");
const TEXT_DATA_PATH = path.resolve(
    process.cwd(),
    "apps/website/data/text-data.json",
);

// --- HELPERS ---
async function getMarkdownFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await getMarkdownFiles(fullPath)));
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
            files.push(fullPath);
        }
    }
    return files;
}

async function loadTextIds(): Promise<Set<string>> {
    const raw = await fs.readFile(TEXT_DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return new Set(Object.keys(data));
}

// --- MAIN VALIDATION ---
async function main() {
    const mdFiles = await getMarkdownFiles(RECAP_DATA_DIR);
    const textIds = await loadTextIds();

    // Collect all glossary entry IDs (by filename)
    const glossaryDir = path.join(RECAP_DATA_DIR, "glossary");
    let glossaryIds = new Set<string>();
    try {
        const glossaryFiles = await getMarkdownFiles(glossaryDir);
        glossaryIds = new Set(
            glossaryFiles.map((f) => path.basename(f, ".md")),
        );
    } catch {
        /* ignore if not present */
    }

    // Tag whitelist
    const VALID_TAGS = new Set([
        "embed",
        "edge",
        "node",
        "easter",
        "text",
        "entry",
        "out",
    ]);

    let hasErrors = false;

    for (const file of mdFiles) {
        const relPath = path.relative(process.cwd(), file);
        const content = await fs.readFile(file, "utf-8");

        // --- Link syntax check ---
        const LINK_RE = /(?<!!)\[([^\]]*)\]\(([^)]*)\)/g;
        let m: RegExpExecArray | null;
        while ((m = LINK_RE.exec(content))) {
            const [full, label, url] = m;
            if (!label.trim()) {
                console.warn(`[${relPath}] empty link label in: ${full}`);
                hasErrors = true;
            }
            if (!url.trim()) {
                console.warn(`[${relPath}] empty URL in: ${full}`);
                hasErrors = true;
            }
        }

        // --- Stray brackets ---
        if (/\[[^\]]*$/.test(content) || /^[^[\]]*\]/m.test(content)) {
            console.warn(`[${relPath}] unbalanced or stray square bracket`);
            hasErrors = true;
        }

        // --- Tag whitelist ---
        const TAG_LINK_RE = /\[([^\]]+)\]\(#[^)]*\)/g;
        while ((m = TAG_LINK_RE.exec(content))) {
            const full = m[0];
            const url = full.match(/\((#[^)]*)\)/)![1];
            const [hashTag] = url.slice(1).split(":", 1);
            if (!VALID_TAGS.has(hashTag)) {
                console.warn(
                    `[${relPath}] unknown #‑tag “${hashTag}” in ${full}`,
                );
                hasErrors = true;
            }
        }

        // --- #entry: checks (glossary) ---
        const ENTRY_REF_RE = /\[[^\]]+\]\(#entry:([^)]+)\)/g;
        while ((m = ENTRY_REF_RE.exec(content))) {
            const refId = m[1].trim();
            if (!glossaryIds.has(refId)) {
                console.warn(
                    `[${relPath}] reference to invalid #entry:${refId}`,
                );
                hasErrors = true;
            }
        }

        // --- #text: checks (text-data.json) ---
        const TEXT_REF_RE = /\[[^\]]+\]\(#text:([^)]+)\)/g;
        while ((m = TEXT_REF_RE.exec(content))) {
            const refId = m[1].trim();
            if (!textIds.has(refId)) {
                console.warn(
                    `[${relPath}] reference to missing #text:${refId}`,
                );
                hasErrors = true;
            }
        }

        // --- Empty #edge: and #node: refs ---
        if (/\[[^\]]*\]\(#edge:\s*\)/.test(content)) {
            console.warn(
                `[${relPath}] empty #edge: reference (no ID provided)`,
            );
            hasErrors = true;
        }
        if (/\[[^\]]*\]\(#node:\s*\)/.test(content)) {
            console.warn(
                `[${relPath}] empty #node: reference (no ID provided)`,
            );
            hasErrors = true;
        }

        // --- Standalone link that probably needs #embed ---
        const lines = content.split(/\r?\n/);
        for (let i = 1; i < lines.length - 1; i++) {
            const prev = lines[i - 1].trim();
            const curr = lines[i].trim();
            const next = lines[i + 1].trim();
            const m = curr.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            if (m && prev === "" && next === "") {
                const url = m[2].trim();
                if (url.startsWith("#embed:")) continue;
                if (/^#\w+:/.test(url)) continue;
                if (/^https?:\/\/(www\.)?(twitter|x)\.com\//.test(url))
                    continue;
                if (EMBED_MISSING_BYPASS_LIST.includes(curr)) continue;
                console.warn(
                    `[${relPath}] potential missing #embed tag around standalone link: ${curr}`,
                );
                hasErrors = true;
            }
        }

        // --- Edge/Node title check ---
        if (relPath.includes("/edges/") || relPath.includes("/nodes/")) {
            const firstLine = lines[0].trim();
            if (!/^<!--\s*title:\s*.+\s*-->$/.test(firstLine)) {
                console.warn(
                    `[${relPath}] missing or malformed edge title comment (should be <!-- title: Your Title --> on line 1)`,
                );
                hasErrors = true;
            }
        }

        // --- Node status check ---
        if (relPath.includes("/nodes/")) {
            const statusLine = lines.find((line) =>
                line.trim().startsWith("<!-- status:"),
            );
            if (
                !statusLine ||
                !/^<!--\s*status:\s*\w+\s*-->$/.test(statusLine)
            ) {
                console.warn(
                    `[${relPath}] missing or malformed node status comment (should be <!-- status: draft/published -->)`,
                );
                hasErrors = true;
            }
        }
    }

    if (hasErrors) {
        console.error("Validation completed with errors.");
        process.exit(1);
    } else {
        console.log("All content references are valid.");
        process.exit(0);
    }
}

main();
