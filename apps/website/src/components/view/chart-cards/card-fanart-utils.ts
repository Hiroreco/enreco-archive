import fanartData from "#/fanart.json";
import type { FanartEntry } from "@/components/view/fanart/FanartModal";

const FANART_LINK_RE =
    /\[[^\]]+\]\((https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^\s)]+)\)/gi;

const fanartEntries = fanartData as FanartEntry[];

const fanartEntryMap = new Map(
    fanartEntries.map((entry) => [normalizeFanartUrl(entry.url), entry]),
);

const FANART_HEADING_PATTERN =
    /^(#{1,6})\s+(Fanart|Fanwork|Fan art|Fan Art|Fan Work|Memes|Meme|ファンアート|ファン作品|ファンワーク|ミーム)(?=\s|$)/i;

function normalizeFanartUrl(url: string): string {
    try {
        const parsedUrl = new URL(url.trim());
        const hostname = parsedUrl.hostname
            .replace(/^www\./i, "")
            .replace(/^twitter\.com$/i, "x.com");
        const pathname = parsedUrl.pathname.toLowerCase().replace(/\/+$/, "");

        return `https://${hostname}${pathname}`;
    } catch {
        return url
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\/(?:www\.)?twitter\.com/i, "https://x.com")
            .replace(/[?#].*$/, "")
            .replace(/\/+$/, "");
    }
}

function findAllFanartSections(
    lines: string[],
): Array<{
    startIndex: number;
    endIndex: number;
    headingLevel: number;
}> {
    const sections: Array<{
        startIndex: number;
        endIndex: number;
        headingLevel: number;
    }> = [];

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const headingMatch = line.match(FANART_HEADING_PATTERN);

        if (headingMatch) {
            const headingLevel = headingMatch[1].length;

            // Find end of section (next heading with same or higher priority)
            let endIndex = lines.length;
            for (let i = index + 1; i < lines.length; i += 1) {
                const nextHeading = lines[i].match(/^(#{1,6})\s+/);
                if (nextHeading && nextHeading[1].length <= headingLevel) {
                    endIndex = i;
                    break;
                }
            }

            sections.push({ startIndex: index, endIndex, headingLevel });
        }
    }

    return sections;
}

export function getCardFanartData(content: string): {
    contentWithoutFanart: string;
    fanartEntries: FanartEntry[];
} {
    if (!content.trim()) {
        return {
            contentWithoutFanart: content,
            fanartEntries: [],
        };
    }

    const normalizedContent = content.replace(/\r\n/g, "\n");
    const lines = normalizedContent.split("\n");

    const sections = findAllFanartSections(lines);

    if (sections.length === 0) {
        return {
            contentWithoutFanart: content,
            fanartEntries: [],
        };
    }

    // Process all sections
    const resolvedFanartEntries: FanartEntry[] = [];
    const sectionsToRemove: number[] = [];

    for (const section of sections) {
        const sectionLines = lines.slice(section.startIndex + 1, section.endIndex);
        const linesToKeepFromSection: string[] = [];

        for (const line of sectionLines) {
            const urlMatches = Array.from(line.matchAll(FANART_LINK_RE));

            if (urlMatches.length === 0) {
                // No URLs in line, keep it (empty lines, text)
                linesToKeepFromSection.push(line);
            } else {
                // Check which URLs are fanart and which are not
                let hasNonFanartUrl = false;
                for (const match of urlMatches) {
                    const url = match[1];
                    const entry = fanartEntryMap.get(normalizeFanartUrl(url));
                    if (entry) {
                        resolvedFanartEntries.push(entry);
                    } else {
                        hasNonFanartUrl = true;
                    }
                }

                // Keep line if it has any non-fanart URLs
                if (hasNonFanartUrl) {
                    linesToKeepFromSection.push(line);
                }
            }
        }

        // Mark section for removal if no content to keep
        const hasContentToKeep = linesToKeepFromSection.some((line) =>
            line.trim(),
        );
        if (!hasContentToKeep) {
            sectionsToRemove.push(section.startIndex);
        }
    }

    if (resolvedFanartEntries.length === 0) {
        return {
            contentWithoutFanart: content,
            fanartEntries: [],
        };
    }

    // Remove sections in reverse order (so indices don't shift)
    let newLines = [...lines];
    for (const sectionStartIndex of sectionsToRemove.sort((a, b) => b - a)) {
        const section = sections.find((s) => s.startIndex === sectionStartIndex)!;
        newLines.splice(section.startIndex, section.endIndex - section.startIndex);
    }

    const contentWithoutFanart = newLines
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return {
        contentWithoutFanart,
        fanartEntries: resolvedFanartEntries,
    };
}