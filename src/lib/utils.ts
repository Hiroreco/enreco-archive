import { DEFAULT_NODE_IMAGE } from "@/lib/constants";
import { ImageNodeType } from "@/lib/type";
import { clsx, type ClassValue } from "clsx";
import blurData from "public/blur-data.json";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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

export const urlToEmbedUrl = (url: string | null) => {
    if (!url) return { videoid: "", params: "" };

    let videoid = url.split("/live/")[1];
    if (videoid) {
        // example https://www.youtube.com/live/2ATTd32AV-Q?feature=shared&t=10481
        let params = videoid.split("?")[1];
        // replace t= with start=, cause YoutubeEmbed uses start= for timestamp (i think)
        params = params.replace("s", "");
        params = params.replace("t=", "start=");
        videoid = videoid.split("?")[0];

        return { videoid, params };
    } else {
        return { videoid: "", params: "" };
    }
};

export const urlToLiveUrl = (url: string) => {
    let correctUrl = url;
    if (!url) return "";
    if (url.includes("/live/")) {
        return url;
    }
    if (url.includes("embed")) {
        // turn embed to live
        // example https://www.youtube.com/embed/1_dhGL0K5-k?si=OCYF7bUx3zTLXPnC&amp;start=7439)
        // to https://www.youtube.com/embed/1_dhGL0K5-k?t=7439
        // This is mostly to handle mistakes I made at the beginning in the markdown
        const videoid = url.split("/embed/")[1].split("?si=")[0];
        const params = url.split("start=")[1];
        correctUrl = `https://www.youtube.com/live/${videoid}?t=${params}`;
    } else if (url.includes("watch")) {
        // turn watch to live
        // example https://www.youtube.com/watch?v=1_dhGL0K5-k&list=PLonYStlm50KZ_rKewRuHUfuEMYbk_hbsi&ab_channel=BoubonClipperCh.
        // to https://www.youtube.com/live/1_dhGL0K5-k
        // This is also mostly to handle mistakes I made at the beginning in the markdown
        const videoid = url.split("v=")[1].split("&")[0];
        const params = url.split("v=")[1].split("&")[1];
        correctUrl = `https://www.youtube.com/live/${videoid}?${params}`;
    }
    return correctUrl;
};
export const idFromDayChapterId = (
    day: number,
    chapter: number,
    id: string,
) => {
    return `${day}-${chapter}-${id}`;
};

export const getBlurDataURL = (imageSrc: string | undefined) => {
    if (!imageSrc) return undefined;
    const filename = imageSrc.split("/").pop()?.split(".")[0];
    // @ts-expect-error
    return filename ? blurData[filename] : imageSrc;
};

export const isMobileViewport = (): boolean => {
    return window.innerWidth <= 768;
};
