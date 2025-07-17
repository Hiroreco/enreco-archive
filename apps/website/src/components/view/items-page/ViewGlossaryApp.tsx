import ViewGlossaryCard from "@/components/view/items-page/ViewGlossaryCard";
import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewMusicPlayerModal from "@/components/view/ViewMusicPlayerModal";
import ViewSettingsModal from "@/components/view/ViewSettingsModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { GlossaryProvider } from "@/contexts/GlossaryContext";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useViewStore } from "@/store/viewStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { Dice6, Disc3, Info, Settings } from "lucide-react";

interface ViewItemsAppProps {
    bgImage: string;
}

const ViewGlossaryApp = ({ bgImage }: ViewItemsAppProps) => {
    const isMusicModalOpen = useMusicPlayerStore((state) => state.isOpen);
    const setIsMusicModalOpen = useMusicPlayerStore((state) => state.setIsOpen);

    const openModal = useViewStore((state) => state.modal.openModal);
    const openInfoModal = useViewStore((state) => state.modal.openInfoModal);
    const openSettingsModal = useViewStore(
        (state) => state.modal.openSettingsModal,
    );
    const openMinigameModal = useViewStore(
        (state) => state.modal.openMinigameModal,
    );
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

            {/* Updated modal pattern to match ViewApp */}
            <ViewInfoModal open={openModal === "info"} onClose={closeModal} />

            <ViewSettingsModal
                open={openModal === "settings"}
                onClose={closeModal}
            />

            <ViewMiniGameModal
                open={openModal === "minigame"}
                onClose={closeModal}
            />

            <ViewVideoModal
                open={openModal === "video"}
                onClose={closeModal}
                videoUrl={videoUrl}
                bgImage={bgImage}
            />

            <ViewMusicPlayerModal
                open={isMusicModalOpen}
                onClose={() => setIsMusicModalOpen(false)}
            />

            <div className="fixed top-0 right-0 m-[8px] z-10 flex md:flex-col gap-[8px]">
                <IconButton
                    id="info-btn"
                    className="size-[40px] p-[4px] hidden md:block"
                    tooltipText="Info"
                    enabled={true}
                    tooltipSide="left"
                    onClick={openInfoModal}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="size-[40px] p-[4px]"
                    tooltipText="Settings"
                    enabled={true}
                    tooltipSide="left"
                    onClick={openSettingsModal}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="size-[40px] p-[4px] hidden md:block"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={openMinigameModal}
                >
                    <Dice6 />
                </IconButton>

                <IconButton
                    id="music-player-btn"
                    className="size-[40px] p-[4px]"
                    tooltipText="Music Player"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => setIsMusicModalOpen(!isMusicModalOpen)}
                >
                    <Disc3 />
                </IconButton>
            </div>
        </div>
    );
};

export default ViewGlossaryApp;
