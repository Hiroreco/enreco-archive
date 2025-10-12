import { useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
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
    const openVideoModal = useViewStore((state) => state.modal.openVideoModal);
    const setVideoUrl = useViewStore((state) => state.modal.setVideoUrl);
    const pauseBGM = useAudioStore((state) => state.pauseBGM);
    const playBGM = useAudioStore((state) => state.playBGM);
    const embedType = useSettingStore((state) => state.embedType);

    const timestampHandler = async (
        event: MouseEvent<HTMLAnchorElement>,
        timestampUrl: string,
    ) => {
        if (embedType === "card") {
            event.preventDefault();
            pauseBGM();

            openVideoModal();
            setVideoUrl(timestampUrl);
        } else {
            // Open in new tab if external
            event.currentTarget.setAttribute("target", "_blank");
            event.currentTarget.setAttribute("rel", "noopener noreferrer");
            event.currentTarget.setAttribute("href", timestampUrl);

            // Pause the BGM, then, when the new tab is closed (the user returns to the site), play the BGM again
            pauseBGM();
            window.addEventListener(
                "focus",
                () => {
                    playBGM();
                },
                { once: true },
            );
        }
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
