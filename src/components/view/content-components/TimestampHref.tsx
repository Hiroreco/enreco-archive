import { useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { useViewStore } from "@/store/viewStore";
import { cn } from "@/lib/utils";
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
    const settingStore = useSettingStore();
    const viewStore = useViewStore();
    const audioStore = useAudioStore();
    const timestampHandler = async (
        event: MouseEvent<HTMLAnchorElement>,
        timestampUrl: string,
    ) => {
        event.preventDefault();
        audioStore.pauseBGM();

        if (settingStore.timestampOption === "modal") {
            viewStore.setVideoModalOpen(true);
            viewStore.setVideoUrl(timestampUrl);
        } else if (settingStore.timestampOption === "tab") {
            window.open(timestampUrl, "_blank");
            // Visibility change listener when user switches tabs
            const handleVisibilityChange = () => {
                if (document.visibilityState === "visible") {
                    audioStore.playBGM();
                    document.removeEventListener(
                        "visibilitychange",
                        handleVisibilityChange,
                    );
                }
            };
            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        }
    };

    return (
        <a
            href={href}
            data-timestamp-url={href}
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
