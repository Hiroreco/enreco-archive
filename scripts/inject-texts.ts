import { TextData } from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const baseDir = path.resolve(__dirname, "..", "recap-data", "texts");
    const outputPath = path.resolve(
        __dirname,
        "..",
        "apps",
        "website",
        "data",
        "text-data.json",
    );

    const result: TextData = {};

    // Recursively walk baseDir
    async function walk(dir: string) {
        for (const name of await fs.readdir(dir)) {
            const full = path.join(dir, name);
            const stat = await fs.stat(full);
            if (stat.isDirectory()) {
                await walk(full);
            } else if (stat.isFile() && name.endsWith(".md")) {
                // Compute category = first segment under baseDir
                const relPath = path.relative(baseDir, full);
                const segments = relPath.split(path.sep);
                const category = segments[0];

                const key = path.basename(name, ".md");
                const raw = await fs.readFile(full, "utf-8");
                const lines = raw.split(/\r?\n/);

                // Extract title
                let title = "";
                let i = 0;
                if (/^<!--\s*title:\s*(.+?)\s*-->$/.test(lines[0])) {
                    title = lines[0]
                        .replace(/^<!--\s*title:\s*(.+?)\s*-->$/, "$1")
                        .trim();
                    i = 1;
                    // skip a following blank line
                    if (lines[1]?.trim() === "") i++;
                }

                const content = lines.slice(i).join("\n").trim();

                result[key] = { title, content, category };
            }
        }
    }

    await walk(baseDir);

    await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`✅ Injected ${result.length} items into ${outputPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
