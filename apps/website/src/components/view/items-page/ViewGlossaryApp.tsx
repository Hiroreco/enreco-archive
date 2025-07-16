import ViewFanartModal from "@/components/view/fanart/ViewFanartModal";
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
import { Dice6, Info, Settings, Disc3, Palette } from "lucide-react";
import { useState } from "react";

interface ViewItemsAppProps {
    bgImage: string;
}

const ViewGlossaryApp = ({ bgImage }: ViewItemsAppProps) => {
    const viewStore = useViewStore();
    const { isOpen: isMusicModalOpen, setIsOpen: setIsMusicModalOpen } =
        useMusicPlayerStore();

    // TODO: Remove this later, don't want to put in the store since have to wait for dev merge
    const [openFanartModal, setOpenFanartModal] = useState(false);
    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <GlossaryProvider>
                <ViewGlossaryCard
                    className="md:max-w-[900px] w-[95vw] mt-8 sm:mt-2"
                    bgImage={bgImage}
                />
            </GlossaryProvider>

            {/* Pretty much the same as ViewApp from here on */}
            <ViewInfoModal
                open={viewStore.infoModalOpen}
                onOpenChange={viewStore.setInfoModalOpen}
            />

            <ViewSettingsModal
                open={viewStore.settingsModalOpen}
                onOpenChange={viewStore.setSettingsModalOpen}
            />

            <ViewMiniGameModal
                open={viewStore.minigameModalOpen}
                onOpenChange={viewStore.setMinigameModalOpen}
            />

            <ViewVideoModal
                open={viewStore.videoModalOpen}
                onOpenChange={viewStore.setVideoModalOpen}
                videoUrl={viewStore.videoUrl}
                bgImage={bgImage}
            />

            <ViewMusicPlayerModal
                open={isMusicModalOpen}
                onOpenChange={setIsMusicModalOpen}
            />

            <ViewFanartModal
                open={openFanartModal}
                onOpenChange={setOpenFanartModal}
                chapter={viewStore.chapter}
                day={viewStore.day}
            />

            <div className="fixed top-0 right-0 m-[8px] z-10 flex md:flex-col gap-[8px]">
                <IconButton
                    id="info-btn"
                    className="size-[40px] p-[4px] hidden md:block"
                    tooltipText="Info"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setInfoModalOpen(true)}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="size-[40px] p-[4px]"
                    tooltipText="Settings"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setSettingsModalOpen(true)}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="size-[40px] p-[4px] hidden md:block"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setMinigameModalOpen(true)}
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

                <IconButton
                    id="fanart-btn"
                    className="size-[40px] p-1"
                    tooltipText="Fanart"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => setOpenFanartModal(!openFanartModal)}
                >
                    <Palette />
                </IconButton>
            </div>
        </div>
    );
};

export default ViewGlossaryApp;
