import { useAudioStore } from "@/store/audioStore";
import { useSettingStore } from "@/store/settingStore";
import { useViewStore } from "@/store/viewStore";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { MouseEvent } from "react";
import { useShallow } from "zustand/shallow";

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
    const timestampOption = useSettingStore(state => state.timestampOption);
    const [ openVideoModal, setVideoUrl ] = useViewStore(useShallow(state => [state.modal.openVideoModal, state.modal.setVideoUrl]));
    const [ playBGM, pauseBGM ] = useAudioStore(useShallow(state => [ state.playBGM, state.pauseBGM ]));
    const timestampHandler = async (
        event: MouseEvent<HTMLAnchorElement>,
        timestampUrl: string,
    ) => {
        event.preventDefault();
        pauseBGM();

        if (timestampOption === "modal") {
            openVideoModal();
            setVideoUrl(timestampUrl);
        } else if (timestampOption === "tab") {
            window.open(timestampUrl, "_blank");
            // Visibility change listener when user switches tabs
            const handleVisibilityChange = () => {
                if (document.visibilityState === "visible") {
                    playBGM();
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
