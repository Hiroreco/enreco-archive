import { DEFAULT_NODE_IMAGE } from "@enreco-archive/common/constants";
import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";
import blurData from "~/blur-data.json";

// Return a lighter or darker version of a color, param is hex color
export function getLighterOrDarkerColor(color: string, percent: number) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const B = ((num >> 8) & 0x00ff) + amt;
    const G = (num & 0x0000ff) + amt;
    const newColor = (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
        (G < 255 ? (G < 1 ? 0 : G) : 255)
    )
        .toString(16)
        .slice(1);
    return `#${newColor}`;
}

export const extractImageSrcFromNodes = (
    nodes: ImageNodeType[],
): { [key: string]: string } => {
    return nodes.reduce((acc: { [key: string]: string }, node) => {
        acc[node.id] = node.data.imageSrc || DEFAULT_NODE_IMAGE;
        return acc;
    }, {});
};

export function extractYouTubeVideoInfo(
    url: string,
): { videoId: string; startTime?: number } | null {
    if (!url) return null;

    // First, extract the video ID using a more specific pattern
    const videoIdRegex =
        /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const videoIdMatch = url.match(videoIdRegex);

    if (!videoIdMatch) return null;

    const videoId = videoIdMatch[1];

    // Then, separately extract time parameters from query string
    const urlObj = new URL(url);
    const startParam =
        urlObj.searchParams.get("start") || urlObj.searchParams.get("t");

    let startTime: number | undefined;

    if (startParam) {
        // Handle different time formats
        if (
            startParam.includes("h") ||
            startParam.includes("m") ||
            startParam.includes("s")
        ) {
            // Format like "1h2m30s" or "2m30s" or "30s"
            const hours = startParam.match(/(\d+)h/)?.[1] || "0";
            const minutes = startParam.match(/(\d+)m/)?.[1] || "0";
            const seconds = startParam.match(/(\d+)s/)?.[1] || "0";
            startTime =
                parseInt(hours) * 3600 +
                parseInt(minutes) * 60 +
                parseInt(seconds);
        } else {
            // Format like "150" (seconds)
            startTime = parseInt(startParam);
        }
    }

    return { videoId, startTime };
}

// ...existing code...

// Updated urlToEmbedUrl function
export function urlToEmbedUrl(videoUrl: string | null): {
    videoid: string;
    params: string;
} {
    if (!videoUrl) return { videoid: "", params: "" };

    const videoInfo = extractYouTubeVideoInfo(videoUrl);

    if (!videoInfo) return { videoid: "", params: "" };

    const params = videoInfo.startTime ? `start=${videoInfo.startTime}` : "";

    return {
        videoid: videoInfo.videoId,
        params,
    };
}
export const idFromChapterDayId = (
    chapter: number,
    day: number,
    id: string,
) => {
    return `${chapter}-${day}-${id}`;
};

export const getBlurDataURL = (imageSrc: string | undefined) => {
    if (!imageSrc) return undefined;
    const filename = imageSrc.split("/").pop()?.split(".")[0];
    // @ts-expect-error blurData is imported as a JSON object without proper typing
    return filename ? blurData[filename] : imageSrc;
};

export const isMobileViewport = (): boolean => {
    if (typeof window !== "undefined") {
        return window.innerWidth <= 768;
    }
    return false;
};

export function isNode(element: ImageNodeType | FixedEdgeType): element is ImageNodeType {
    return !!(element as ImageNodeType)?.position;
}

export function isEdge(element: ImageNodeType | FixedEdgeType): element is FixedEdgeType {
    return !!(element as FixedEdgeType)?.source;
}
