import { MediaType } from "@enreco-archive/common/types";

export type LocalizedString = {
    en: string;
    ja: string;
};

export type MediaEntry = {
    title: string;
    originalUrl: string;
    thumbnailUrl: string;
    info: string;
    src: string;
    type: MediaType;
};

export type LocalizedMediaEntry = {
    title: LocalizedString;
    originalUrl: string;
    thumbnailUrl: string;
    info: LocalizedString;
    src: string;
    type: MediaType;
};

export type RecollectionArchiveEntry = {
    id: string;
    title: string;
    description: string;
    info?: string;
    chapter: number;
    entries: MediaEntry[];
    thumbnailUrl: string;
};

export type LocalizedRecollectionArchiveEntry = {
    id: string;
    title: LocalizedString;
    description: LocalizedString;
    info: LocalizedString;
    chapter: number;
    entries: LocalizedMediaEntry[];
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
