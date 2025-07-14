export interface GalleryItem {
    src: string;
    alt: string;
    type: "image" | "video";
    width?: number;
    height?: number;
}
