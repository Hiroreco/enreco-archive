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
};
