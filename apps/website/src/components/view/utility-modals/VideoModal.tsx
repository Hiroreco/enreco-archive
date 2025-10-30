import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { urlToEmbedUrl } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { YouTubeEmbed } from "@next/third-parties/google";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSettingStore } from "@/store/settingStore";
import { useCallback } from "react";

interface ViewVideoModalProps {
    open: boolean;
    onClose: () => void;
    videoUrl: string | null;
    bgImage: string;
}

const ViewVideoModal = ({
    open,
    onClose,
    videoUrl,
    bgImage,
}: ViewVideoModalProps) => {
    const { videoid, params } = urlToEmbedUrl(videoUrl);
    const playBGM = useAudioStore((state) => state.playBGM);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);
    const handleOpenChange = useCallback(
        (newOpen: boolean) => {
            if (!newOpen) {
                playBGM();
                onClose();
            }
        },
        [onClose, playBGM],
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Video modal for ${videoUrl}</DialogTitle>
            </VisuallyHidden>

            <DialogContent
                backdropFilter={backdropFilter}
                // When we have the video dialog open on mobile, if we flip from portrait -> landscape -> portrait
                // the overlay for some reason targets the drawer instead of this modal, so tapping outsite would close the drawer instead of the modal
                // so we're adding a custom overlay to prevent that
                // TODO: Remove this when we have a better solution
                customOverlay={
                    <DialogOverlay
                        backdropFilter={backdropFilter}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleOpenChange(false);
                        }}
                    />
                }
                className="rounded-lg lg:w-[60vw] md:w-[80vw] max-w-none w-[95vw] h-auto aspect-video p-2 z-100"
                style={{
                    backgroundImage: `url('${bgImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <VisuallyHidden>
                    <DialogDescription>
                        Watch the video of the story
                    </DialogDescription>
                </VisuallyHidden>
                <YouTubeEmbed
                    videoid={videoid}
                    params={params}
                    style="max-width: 100%; max-height: 100%;"
                />
            </DialogContent>
        </Dialog>
    );
};

export default ViewVideoModal;
