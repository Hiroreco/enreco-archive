export type MediaEntry = {
    title: string;
    originalUrl: string;
    thumbnailUrl: string;
    info: string;
    src: string;
    type: "video" | "image";
};

export type RecollectionArchiveEntry = {
    id: string;
    title: string;
    description: string;
    chapter: number;
    category: string;
    entries: MediaEntry[];
};
