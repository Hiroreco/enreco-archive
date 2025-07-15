import { getBlurDataURL } from "@/lib/utils";
import { ExternalLink, ImageIcon, Play } from "lucide-react";
import Image from "next/image";

interface FanartEntry {
    url: string;
    label: string;
    author: string;
    chapter: number;
    day: number;
    characters: string[];
    images: {
        src: string;
        width: number;
        height: number;
    }[];
    videos: {
        src: string;
    }[];
}

interface FanartCardProps {
    entry: FanartEntry;
    index: number;
    onClick: (index: number) => void;
}

const FanartCard = ({ entry, index, onClick }: FanartCardProps) => {
    // Prefer images over videos for thumbnail
    const firstImage = entry.images[0];
    const firstVideo = entry.videos[0];
    const hasVideo = entry.videos.length > 0;
    const totalMediaCount = entry.images.length + entry.videos.length;

    // For video-only entries, we'll use a placeholder or video thumbnail approach
    const isVideoOnly = !firstImage && hasVideo;

    if (isVideoOnly) {
        // Video-only card with thumbnail
        const videoName =
            firstVideo.src
                .split("/")
                .pop()
                ?.replace(/\.[^/.]+$/, "") || "";
        const thumbnailSrc = `images-opt/${videoName}-thumb.webp`;

        return (
            <div
                className="relative group bg-muted rounded-lg overflow-hidden cursor-pointer break-inside-avoid mb-4"
                onClick={() => onClick(index)}
            >
                <Image
                    src={thumbnailSrc}
                    alt={entry.label}
                    width={300}
                    height={169} // 16:9 aspect ratio fallback
                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                    placeholder={
                        getBlurDataURL(`${videoName}-thumb`) ? "blur" : "empty"
                    }
                    blurDataURL={getBlurDataURL(`${videoName}-thumb`)}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />

                {/* Media count badge for videos */}
                {totalMediaCount > 1 && (
                    <div className="flex item-center gap-1 absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                        <Play size={16} />
                        <span>{totalMediaCount}</span>
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 rounded-full p-3 group-hover:bg-black/70 transition-colors">
                        <Play className="md:size-8 size-4 text-white fill-white" />
                    </div>
                </div>

                <div className="md:flex hidden absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg items-center gap-1">
                    <Play size={12} />
                    <span>Video</span>
                </div>

                {/* Mobile - always visible info */}
                <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <FanartCardInfo entry={entry} />
                </div>

                {/* Desktop - hover overlay */}
                <div className="hidden md:flex flex-col absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors justify-end p-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <FanartCardInfo entry={entry} />
                </div>
            </div>
        );
    }

    // Image-based card (with possible videos)
    const thumbnailSrc = firstImage.src.replace("-opt.webp", "-opt-thumb.webp");

    return (
        <div
            className="relative group bg-muted rounded-lg overflow-hidden cursor-pointer break-inside-avoid mb-4"
            onClick={() => onClick(index)}
        >
            <Image
                src={thumbnailSrc}
                alt={entry.label}
                width={firstImage.width}
                height={firstImage.height}
                className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                placeholder={getBlurDataURL(thumbnailSrc) ? "blur" : "empty"}
                blurDataURL={getBlurDataURL(thumbnailSrc)}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />

            {/* Mixed media count badge */}
            {totalMediaCount > 1 && (
                <div className="flex item-center gap-1 absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                    {hasVideo ? (
                        <>
                            <Play size={16} />
                            <span>{totalMediaCount}</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon size={16} />
                            <span>{entry.images.length}</span>
                        </>
                    )}
                </div>
            )}

            {/* Video indicator for mixed media */}
            {hasVideo && firstImage && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                    <Play size={12} />
                    <span>+Video</span>
                </div>
            )}

            {/* Mobile - always visible info */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <FanartCardInfo entry={entry} />
            </div>

            {/* Desktop - hover overlay */}
            <div className="hidden md:flex flex-col absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors justify-end p-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                <FanartCardInfo entry={entry} />
            </div>
        </div>
    );
};

const FanartCardInfo = ({ entry }: { entry: FanartEntry }) => (
    <div className="text-white flex flex-col min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">
            <p className="text-white text-xs font-semibold line-clamp-1 mb-0.5">
                {entry.label}
            </p>
            <p className="text-white/80 text-xs mb-1 line-clamp-1">
                by {entry.author}
            </p>
        </div>
        <div className="md:static absolute bottom-2 right-2 flex items-center justify-between flex-shrink-0">
            <div className="text-xs text-white whitespace-nowrap truncate md:block hidden">
                Ch. {entry.chapter + 1} Day {entry.day + 1}
            </div>
            <a
                className="px-1.5 py-1 border-white/30 rounded-lg border stroke-white flex items-center justify-center hover:bg-white/20 pointer-events-auto flex-shrink-0 ml-2"
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
            >
                <ExternalLink className="size-3 md:size-4 stroke-inherit" />
            </a>
        </div>
    </div>
);

export default FanartCard;
