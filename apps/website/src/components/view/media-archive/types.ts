import { MediaType } from "@enreco-archive/common/types";

export type MediaEntry = {
    title: string;
    originalUrl: string;
    thumbnailUrl: string;
    info: string;
    src: string;
    type: MediaType;
};

export type RecollectionArchiveEntry = {
    id: string;
    title: string;
    description: string;
    info?: string;
    chapter: number;
    category: string;
    entries: MediaEntry[];
    thumbnailUrl: string;
};

export type ClipEntry = {
    id: string;
    originalUrl: string;
    title: string;
    thumbnailSrc: string;
    author: string;
    duration: number;
    uploadDate: string;
    categories: string[];
    chapter: number;
    contentType: "clip" | "stream";
};
export type ClipsData = {
    clips: ClipEntry[];
    streams: ClipEntry[];
};
