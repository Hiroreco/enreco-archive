import GlossaryCard from "@/components/view/glossary/GlossaryCard";
import VideoModal from "@/components/view/utility-modals/VideoModal";
import { GlossaryProvider } from "@/contexts/GlossaryContext";
import { useViewStore } from "@/store/viewStore";
import SpoilerModal from "@/components/view/basic-modals/SpoilerModal";
import ModalCollection from "../basic-modals/ModalCollection";

interface ItemsAppProps {
    bgImage: string;
}

const GlossaryApp = ({ bgImage }: ItemsAppProps) => {
    const openModal = useViewStore((state) => state.modal.openModal);
    const closeModal = useViewStore((state) => state.modal.closeModal);
    const videoUrl = useViewStore((state) => state.modal.videoUrl);

    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <GlossaryProvider>
                <GlossaryCard
                    className="md:max-w-[900px] w-[95vw] mt-8 sm:mt-2"
                    bgImage={bgImage}
                />
            </GlossaryProvider>

            <SpoilerModal />

            <VideoModal
                open={openModal === "video"}
                onClose={closeModal}
                videoUrl={videoUrl}
                bgImage={bgImage}
            />
            <ModalCollection
                modals={["fanart", "settings", "minigame", "music", "info"]}
                hideOnMobile={["minigame", "info"]}
            />
        </div>
    );
};

export default GlossaryApp;
