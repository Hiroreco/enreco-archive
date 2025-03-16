import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { urlToEmbedUrl } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { YouTubeEmbed } from "@next/third-parties/google";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ViewVideoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoUrl: string | null;
    bgImage: string;
}

const ViewVideoModal = ({
    open,
    onOpenChange,
    videoUrl,
    bgImage,
}: ViewVideoModalProps) => {
    const { videoid, params } = urlToEmbedUrl(videoUrl);
    const audioStore = useAudioStore();
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            audioStore.playBGM();
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Video modal for ${videoUrl}</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                className="rounded-lg lg:w-[60vw] md:w-[80vw] max-w-none w-[95vw] h-auto aspect-video p-2 z-[100]"
                style={{
                    // The optimized background looks bad so using original for now
                    backgroundImage: `url('${bgImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >
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
