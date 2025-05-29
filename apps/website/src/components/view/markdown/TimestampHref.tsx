import { useAudioStore } from "@/store/audioStore";
import { useViewStore } from "@/store/viewStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { MouseEvent } from "react";

export type HrefType = "embed" | "general";

interface TimestampHrefProps {
    href: string;
    caption?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rest?: any;
    type: HrefType;
}

const TimestampHref = ({
    href,
    type,
    caption,
    ...rest
}: TimestampHrefProps) => {
    const setVideoModalOpen = useViewStore((state) => state.setVideoModalOpen);
    const setVideoUrl = useViewStore((state) => state.setVideoUrl);
    const pauseBGM = useAudioStore((state) => state.pauseBGM);
    const timestampHandler = async (
        event: MouseEvent<HTMLAnchorElement>,
        timestampUrl: string,
    ) => {
        event.preventDefault();
        pauseBGM();

        setVideoModalOpen(true);
        setVideoUrl(timestampUrl);
    };

    return (
        <a
            href={href}
            data-timestamp-url={href}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => timestampHandler(e, href)}
            {...rest}
            className={cn({
                "block text-center italic underline underline-offset-4 font-medium text-[1.125rem]":
                    type === "embed",
                "font-medium": type === "general",
            })}
        >
            {caption}
        </a>
    );
};

export default TimestampHref;
