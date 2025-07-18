import { getBlurDataURL } from "@/lib/utils";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Play } from "lucide-react";
import Image from "next/image";
import ReactPlayer from "react-player";

interface LightboxTriggerProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    type: "image" | "video";
    className?: string;
    priority: boolean;
    onClick: () => void;
}

export const LightboxTrigger = ({
    src,
    alt,
    width,
    height,
    type,
    className,
    priority,
    onClick,
}: LightboxTriggerProps) => {
    if (type === "image") {
        return (
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn(
                    "cursor-pointer transition-opacity hover:opacity-90",
                    className,
                )}
                placeholder={getBlurDataURL(src) ? "blur" : "empty"}
                blurDataURL={getBlurDataURL(src)}
                priority={priority}
                onClick={onClick}
            />
        );
    }

    return (
        <div
            className={cn("cursor-pointer relative", className)}
            onClick={onClick}
        >
            <ReactPlayer
                src={src}
                width={width}
                height={height}
                light={true}
                playIcon={<Play className="text-white w-16 h-16" />}
                volume={0.3}
            />
        </div>
    );
};
