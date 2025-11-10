import { MediaType } from "@enreco-archive/common/types";

export interface GalleryItem {
    src: string;
    alt: string;
    type: MediaType;
    width?: number;
    height?: number;
    thumbnailSrc?: string;
    chapter?: number;
    day?: number;
}
