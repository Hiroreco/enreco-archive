import ViewVideoArchiveCard from "@/components/view/media-archive/MediaArchiveCard";
import ModalCollection from "../basic-modals/ModalCollection";

interface VideoArchiveAppProps {
    bgImage: string;
}

const VideoArchiveApp = ({ bgImage }: VideoArchiveAppProps) => {
    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <ViewVideoArchiveCard
                className="md:max-w-[1200px] w-[95vw] mt-8 sm:mt-2"
                bgImage={bgImage}
            />
            <ModalCollection
                modals={["fanart", "settings", "minigame", "music", "info"]}
                hideOnMobile={["minigame", "info"]}
            />
        </div>
    );
};

export default VideoArchiveApp;
