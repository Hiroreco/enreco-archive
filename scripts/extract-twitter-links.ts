import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function walkDir(dir: string, base: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        const rel = path.relative(base, full);

        // Skip anything under recap-data/glossary
        if (rel.split(path.sep)[0] === "glossary") continue;

        if (ent.isDirectory()) {
            files.push(...(await walkDir(full, base)));
        } else if (ent.isFile() && full.endsWith(".md")) {
            files.push(full);
        }
    }
    return files;
}

async function main() {
    // 1) Base folder to scan (recap-data/)
    const base = path.resolve(__dirname, "..", "recap-data");
    // These are videos/non-fanart, so can't be downloaded
    let blacklistUrls = [
        "https://x.com/shutowl/status/1830517595768000529",
        "https://x.com/Chalek0/status/1832964350597804334",
        "https://x.com/WaywardAdlo/status/1832901859667005729",
        "https://x.com/pappikapon/status/1832185189864239450",
        "https://x.com/EmicoOtero/status/1832447889794331060",
        "https://x.com/irys_en/status/1831979038820450676",
        "https://x.com/M_Agho/status/1926008375482990741",
        "https://x.com/M_Agho/status/1921857159337300240",
        "https://x.com/paw_chie/status/1923480569280856202",
        "https://x.com/zelmaelstrom/status/1922782098202488961",
        "https://x.com/_se_t_/status/1919743867081130432",
        "https://x.com/massiveyog/status/1919634283809144908?s=46&t=Hs_QRLG_ayqKN5hO2BW3-A",
        "https://x.com/hiroavrs/status/1919392962670452788",
        "https://x.com/zelmaelstrom/status/1924142831410856372",
        "https://x.com/Keiseeaaa/status/1925918187972964430",
        "https://x.com/Keiseeaaa/status/1923701440473858538",
        "https://x.com/hikienlaventana/status/1924207173829083449",
        "https://x.com/zelmaelstrom/status/1922143256164356165",
        "https://x.com/thekaiyip/status/1921344476032663740",
        "https://x.com/_se_t_/status/1921155712278798577",
        "https://x.com/harutimu_415/status/1921663069068906634",
        "https://x.com/akashibag/status/1921577417602154658",
        "https://x.com/hololive_En/status/1830425412440404160",
        "https://x.com/hololive_En/status/1830787800968638636",
        "https://x.com/hololive_En/status/1831150187605049574",
        "https://x.com/hololive_En/status/1831512579405181432",
        "https://x.com/ourokronii/status/1832266311625306551",
        "https://x.com/Rando_ZLink/status/1920072518939132072",
        "https://x.com/Chalek0/status/1923051887990800540/video/1",
        "https://x.com/lestkrr/status/1922074979434184946",
        "https://x.com/sirshadenfreude/status/1919955783967490180",
        "https://x.com/detectivefalyn/status/1919579661480169695",
        "https://x.com/hatakekelly/status/1920140228473630955",
        "https://x.com/zelmaelstrom/status/1919583127711973790",
        "https://x.com/lillian5090/status/1920258639580766280",
    ];
    blacklistUrls = blacklistUrls.map((url) => url.toLowerCase());

    let mdFiles: string[];
    try {
        mdFiles = await walkDir(base, base);
    } catch (err) {
        console.error(`Error reading base folder "${base}":`, err);
        process.exit(1);
    }

    const linkEntries: Array<{
        url: string;
        label: string;
        author: string;
        chapter: number;
        day: number;
        characters: string[];
    }> = [];

    // matches [label](https://twitter.com/USER/status/123...) or x.com
    const LINK_RE =
        /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:twitter|x)\.com)\/([^\/]+)(\/status\/\d+[^\)]*)\)/g;

    for (const file of mdFiles) {
        const rel = path.relative(base, file);
        const parts = rel.split(path.sep);
        const chapterPart = parts.find((p) => /^chapter\d+$/i.test(p)) || "";
        const dayPart = parts.find((p) => /^day\d+$/i.test(p)) || "";
        const filename = path.basename(file, ".md");
        const character = filename.replace(/-c\d+d\d+$/, "");
        const characters = character
            .split("-")
            .map((c) => c.trim())
            .map((c) => (c === "recap" ? "various" : c));

        const text = await fs.readFile(file, "utf-8");
        let m: RegExpExecArray | null;
        while ((m = LINK_RE.exec(text))) {
            let [, label, host, author, statusPath] = m;
            const url = `${host}/${author}${statusPath}`.toLowerCase();
            author = author.toLowerCase();
            if (blacklistUrls.includes(url)) {
                console.log(`Skipping blacklisted URL: ${url}`);
                continue;
            }
            // Skip if link already exists
            if (linkEntries.some((entry) => entry.url === url)) {
                console.log(`Skipping duplicate URL: ${url}`);
                continue;
            }
            linkEntries.push({
                url: url,
                label,
                author,
                chapter: parseInt(chapterPart.replace(/^chapter/, "")) - 1,
                day: parseInt(dayPart.replace(/^day/, "")) - 1,
                characters,
            });
        }
    }

    // write out
    const outPath = path.resolve(
        __dirname,
        "..",
        "src",
        "data",
        "twitter-links.json",
    );
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(linkEntries, null, 2), "utf-8");

    console.log(
        `✅ Extracted ${linkEntries.length} Twitter/X links to ${outPath}`,
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
