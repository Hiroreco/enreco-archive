import { getBlurDataURL } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import Image from "next/image";
import { memo, useState } from "react";

interface ViewLightboxProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
}

const ViewLightbox = ({
    src,
    alt,
    width = 500,
    height = 500,
    className,
    priority = false,
}: ViewLightboxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    return (
        <div>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={cn("cursor-pointer hover:opacity-90", className)}
                placeholder="blur"
                blurDataURL={getBlurDataURL(src)}
                priority={priority}
                onClick={() => handleOpenChange(true)}
            />

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                    backdropFilter={backdropFilter}
                    className="max-w-fit p-0 gap-2 border-0 bg-none flex flex-col items-center shadow-none"
                    showXButton={false}
                    style={{
                        backgroundImage: "none",
                        backgroundColor: "transparent",
                    }}
                >
                    <DialogTitle className="sr-only">
                        <VisuallyHidden>{alt}</VisuallyHidden>
                    </DialogTitle>

                    <DialogDescription className="sr-only">
                        <VisuallyHidden>{alt}</VisuallyHidden>
                    </DialogDescription>

                    <button
                        onClick={() => handleOpenChange(false)}
                        className="absolute -top-7 size-6 right-0 text-white hover:text-gray-300 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X className="size-full" />
                    </button>
                    <div className="relative lg:w-[60vw] md:w-[80vw] w-[95vw] aspect-video">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-cover"
                            placeholder="blur"
                            blurDataURL={getBlurDataURL(src)}
                        />
                    </div>
                    <span className=" text-white text-center font-semibold text-sm md:text-lg">
                        {alt}
                    </span>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default memo(ViewLightbox);
