import fs from "fs/promises";
import path from "path";

async function walkDir(dir: string, base: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        const rel = path.relative(base, full);

        if (rel.split(path.sep)[0] === "glossary") continue;
        if (rel.split(path.sep)[0] === "media-archive") continue;

        if (ent.isDirectory()) {
            files.push(...(await walkDir(full, base)));
        } else if (ent.isFile() && full.endsWith(".md")) {
            files.push(full);
        }
    }
    return files;
}

function parseCharacterComments(text: string, linkUrl: string): string[] {
    // Look for comments after the specific link
    const linkPattern = new RegExp(
        `\\[.*?\\]\\(${linkUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`,
        "gi",
    );

    const matches = [...text.matchAll(linkPattern)];
    if (matches.length === 0) return [];

    // Find the last match (in case the same link appears multiple times)
    const lastMatch = matches[matches.length - 1];
    const afterLinkText = text.slice(lastMatch.index! + lastMatch[0].length);

    // Look for the first comment after the link
    const commentMatch = afterLinkText.match(/^\s*<!--\s*(.+?)\s*-->/);
    if (!commentMatch) return [];

    // Parse comma-separated characters
    return commentMatch[1]
        .split(",")
        .map((char) => char.trim())
        .filter((char) => char.length > 0);
}

async function main() {
    // 1) Base folder to scan (recap-data/)
    const base = path.resolve(process.cwd(), "recap-data");
    // These are gifs/non-fanart/private/too big, so can't be downloaded
    let blacklistUrls = [
        "https://x.com/pappikapon/status/1832185189864239450",
        "https://x.com/irys_en/status/1831979038820450676",
        "https://x.com/zelmaelstrom/status/1922782098202488961",
        "https://x.com/zelmaelstrom/status/1924142831410856372",
        "https://x.com/zelmaelstrom/status/1922143256164356165",
        "https://x.com/akashibag/status/1921577417602154658",
        "https://x.com/hololive_En/status/1830425412440404160",
        "https://x.com/hololive_En/status/1830787800968638636",
        "https://x.com/hololive_En/status/1831150187605049574",
        "https://x.com/hololive_En/status/1831512579405181432",
        "https://x.com/ourokronii/status/1832266311625306551",
        "https://x.com/Rando_ZLink/status/1920072518939132072",
        "https://x.com/sirshadenfreude/status/1919955783967490180",
        "https://x.com/detectivefalyn/status/1919579661480169695",
        "https://x.com/hatakekelly/status/1920140228473630955",
        "https://x.com/zelmaelstrom/status/1919583127711973790",
        "https://x.com/lillian5090/status/1920258639580766280",
        "https://x.com/ThatCello/status/1921233137280880850",
        "https://x.com/thekaiyip/status/1921344476032663740",
        "https://x.com/_se_t_/status/1921155712278798577",
        "https://x.com/keiseeaaa/status/1923701440473858538",
        "https://x.com/_se_t_/status/1919743867081130432",
    ];

    // For pieces that were comissioned by another artist, we want to credit them instead
    // of using the twitter link in the post.
    const comissionedEntries = [
        {
            link: "https://x.com/aeliaes/status/1968027103695180130",
            author: "paw_chie",
        },
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
        type: "art" | "meme";
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
        let characters: string[] = [];
        if (character !== "recap") {
            characters = character.split("-").map((c) => c.trim());
        }
        const text = await fs.readFile(file, "utf-8");

        // Find the position of the memes section
        const memesSectionMatch = text.match(/^##\s*Meme(s)?\s*$/m);
        const memesSectionIndex = memesSectionMatch
            ? memesSectionMatch.index!
            : -1;

        let m: RegExpExecArray | null;
        while ((m = LINK_RE.exec(text))) {
            let [, label, host, author, statusPath] = m;
            const url = `${host}/${author}${statusPath}`.toLowerCase();
            author = author.toLowerCase();
            // Check for comissioned entries
            const comissioned = comissionedEntries.find(
                (entry) => entry.link.toLowerCase() === url,
            );
            if (comissioned) {
                author = comissioned.author.toLowerCase();
            }

            // Clean up label by removing "by {author}" pattern at the end
            const byAuthorPattern = /\s+by\s+.+$/i;
            label = label.replace(byAuthorPattern, "").trim();

            if (blacklistUrls.includes(url)) {
                console.log(`Skipping blacklisted URL: ${url}`);
                continue;
            }

            // Skip if link already exists
            if (linkEntries.some((entry) => entry.url === url)) {
                console.log(`Skipping duplicate URL: ${url}`);
                continue;
            }

            // Check for character comments after the link
            const commentCharacters = parseCharacterComments(text, url);
            const finalCharacters =
                commentCharacters.length > 0
                    ? [...new Set([...characters, ...commentCharacters])]
                    : characters;

            // Determine type based on position relative to memes section
            const linkIndex = m.index;
            const type: "art" | "meme" =
                memesSectionIndex >= 0 && linkIndex > memesSectionIndex
                    ? "meme"
                    : "art";

            linkEntries.push({
                url: url,
                label,
                author,
                chapter: parseInt(chapterPart.replace(/^chapter/, "")) - 1,
                day: parseInt(dayPart.replace(/^day/, "")) - 1,
                characters: finalCharacters,
                type,
            });
        }
    }
    // write out
    const outPath = path.resolve(
        process.cwd(),
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
