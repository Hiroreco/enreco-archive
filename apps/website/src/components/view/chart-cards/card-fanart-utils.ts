import fanartData from "#/fanart.json";
import type { FanartEntry } from "@/components/view/fanart/FanartModal";

const FANART_LINK_RE =
    /\[[^\]]+\]\((https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^\s)]+)\)/gi;

const fanartEntries = fanartData as FanartEntry[];

const fanartEntryMap = new Map(
    fanartEntries.map((entry) => [normalizeFanartUrl(entry.url), entry]),
);

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

    let sectionStartIndex = -1;
    let sectionEndIndex = lines.length;
    let sectionHeadingLevel = 0;

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const headingMatch = line.match(/^(#{1,6})\s+(Fanart|Fanwork|ファンアート)(?=\s|$)/i);

        if (headingMatch) {
            sectionStartIndex = index;
            sectionHeadingLevel = headingMatch[1].length;
            break;
        }
    }

    if (sectionStartIndex === -1) {
        return {
            contentWithoutFanart: content,
            fanartEntries: [],
        };
    }

    for (let index = sectionStartIndex + 1; index < lines.length; index += 1) {
        const headingMatch = lines[index].match(/^(#{1,6})\s+/);

        if (headingMatch && headingMatch[1].length <= sectionHeadingLevel) {
            sectionEndIndex = index;
            break;
        }
    }

    // Process lines in the fanart section and separate fanart from other content
    const fanartSectionLines = lines.slice(sectionStartIndex + 1, sectionEndIndex);
    const resolvedFanartEntries: FanartEntry[] = [];
    const linesToKeepFromSection: string[] = [];

    for (const line of fanartSectionLines) {
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

    if (resolvedFanartEntries.length === 0) {
        return {
            contentWithoutFanart: content,
            fanartEntries: [],
        };
    }

    // Remove section heading if no lines to keep, otherwise keep it with the remaining lines
    let newLines: string[];
    const hasContentToKeep = linesToKeepFromSection.some((line) => line.trim());

    if (hasContentToKeep) {
        // Keep the section heading and lines with non-fanart content
        newLines = [
            ...lines.slice(0, sectionStartIndex),
            lines[sectionStartIndex], // Keep the heading
            ...linesToKeepFromSection,
            ...lines.slice(sectionEndIndex),
        ];
    } else {
        // Remove the entire section including heading
        newLines = [
            ...lines.slice(0, sectionStartIndex),
            ...lines.slice(sectionEndIndex),
        ];
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