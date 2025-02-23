import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { urlToEmbedUrl } from "@/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { YouTubeEmbed } from "@next/third-parties/google";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ViewVideoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    videoUrl: string | null;
    useDarkMode: boolean;
}

const ViewVideoModal = ({
    open,
    onOpenChange,
    videoUrl,
    useDarkMode
}: ViewVideoModalProps) => {
    const { videoid, params } = urlToEmbedUrl(videoUrl);
    const audioStore = useAudioStore();
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            audioStore.playBGM();
        }
        onOpenChange(newOpen);
    };

    let bgImage = "bg.webp";
    if(useDarkMode) {
        bgImage = "bg-dark.png";
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Video modal for ${videoUrl}</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                className="rounded-lg lg:w-[60vw] md:w-[80vw] max-w-none w-[95vw] h-auto aspect-video p-2"
                style={{
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
