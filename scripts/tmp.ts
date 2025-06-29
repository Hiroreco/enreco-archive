// scripts/fix-twitter-image-indices.ts
import fs from "fs/promises";
import path from "path";

const IMAGE_DIR = path.resolve(process.cwd(), "fanart");
const EXT_REGEX = /\.(jpe?g|png|gif)$/i;

/**
 * Compute the new filename:
 * - If base ends with _N where 1 ≤ N ≤ 9, decrement: _1→_0, _2→_1, etc.
 * - If base ends with _0, leave it alone.
 * - Otherwise, append _0.
 */
function computeNewName(filename: string): string {
    const extMatch = filename.match(EXT_REGEX);
    if (!extMatch) return filename;
    const ext = extMatch[0];
    const base = filename.slice(0, -ext.length);

    const m = base.match(/^(.*)_([0-9]+)$/);
    if (m) {
        const root = m[1];
        const idx = parseInt(m[2], 10);
        if (idx >= 0 && idx <= 9) {
            const newIdx = idx;
            return `${root}-${newIdx}${ext}`;
        }
        // idx > 9 → it's likely part of tweet ID → fall through to append _0
    }
    // no suffix or large number → add _0
    return `${base}-0${ext}`;
}

async function main() {
    let files: string[];
    try {
        files = await fs.readdir(IMAGE_DIR);
    } catch (err) {
        console.error(`Failed to read directory ${IMAGE_DIR}:`, err);
        process.exit(1);
    }

    // Prepare rename mappings
    const mappings: Array<{ from: string; temp: string; to: string }> = [];

    for (const file of files) {
        if (!EXT_REGEX.test(file)) continue;
        const oldPath = path.join(IMAGE_DIR, file);
        const newName = computeNewName(file);
        if (newName === file) continue; // no change
        const tempPath = oldPath + ".renaming";
        const targetPath = path.join(IMAGE_DIR, newName);
        mappings.push({ from: oldPath, temp: tempPath, to: targetPath });
    }

    // First pass: rename all originals to temp paths
    for (const { from, temp } of mappings) {
        try {
            await fs.rename(from, temp);
            console.log(
                `→ Moved ${path.basename(from)} → ${path.basename(temp)}`,
            );
        } catch (err) {
            console.error(`Failed to move ${from} → ${temp}:`, err);
        }
    }

    // Second pass: rename temps to final targets
    for (const { temp, to } of mappings) {
        try {
            // If target exists (unlikely), overwrite
            try {
                await fs.unlink(to);
            } catch {}
            await fs.rename(temp, to);
            console.log(
                `✅ Renamed ${path.basename(temp)} → ${path.basename(to)}`,
            );
        } catch (err) {
            console.error(`Failed to rename ${temp} → ${to}:`, err);
        }
    }

    console.log("🎉 All filenames fixed.");
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});
