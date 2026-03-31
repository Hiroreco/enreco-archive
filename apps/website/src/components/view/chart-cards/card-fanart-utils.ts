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

function extractFanartUrls(sectionContent: string): string[] {
    const urls: string[] = [];

    for (const match of sectionContent.matchAll(FANART_LINK_RE)) {
        urls.push(match[1]);
    }

    return Array.from(new Set(urls));
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
        const headingMatch = line.match(/^(#{1,6})\s+Fanart\b/i);

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

    const fanartSectionContent = lines
        .slice(sectionStartIndex + 1, sectionEndIndex)
        .join("\n");
    const resolvedEntries = extractFanartUrls(fanartSectionContent)
        .map((url) => fanartEntryMap.get(normalizeFanartUrl(url)) ?? null)
        .filter((entry): entry is FanartEntry => entry !== null);

    if (resolvedEntries.length === 0) {
        return {
            contentWithoutFanart: content,
            fanartEntries: [],
        };
    }

    const contentWithoutFanart = [
        ...lines.slice(0, sectionStartIndex),
        ...lines.slice(sectionEndIndex),
    ]
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return {
        contentWithoutFanart,
        fanartEntries: resolvedEntries,
    };
}