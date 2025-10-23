import ViewGlossaryCard from "@/components/view/glossary/ViewGlossaryCard";
import ViewVideoModal from "@/components/view/utility-modals/ViewVideoModal";
import { GlossaryProvider } from "@/contexts/GlossaryContext";
import { useViewStore } from "@/store/viewStore";
import ViewSpoilerModal from "@/components/view/basic-modals/ViewSpoilerModal";
import ViewModalCollection from "../basic-modals/ViewModalCollection";

interface ViewItemsAppProps {
    bgImage: string;
}

const ViewGlossaryApp = ({ bgImage }: ViewItemsAppProps) => {
    const openModal = useViewStore((state) => state.modal.openModal);
    const closeModal = useViewStore((state) => state.modal.closeModal);
    const videoUrl = useViewStore((state) => state.modal.videoUrl);

    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <GlossaryProvider>
                <ViewGlossaryCard
                    className="md:max-w-[900px] w-[95vw] mt-8 sm:mt-2"
                    bgImage={bgImage}
                />
            </GlossaryProvider>

            <ViewSpoilerModal />

            <ViewVideoModal
                open={openModal === "video"}
                onClose={closeModal}
                videoUrl={videoUrl}
                bgImage={bgImage}
            />
            <ViewModalCollection
                modals={["fanart", "settings", "minigame", "music", "info"]}
                hideOnMobile={["minigame", "info"]}
            />
        </div>
    );
};

export default ViewGlossaryApp;
