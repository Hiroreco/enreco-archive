import FanartModal from "@/components/view/fanart/FanartModal";
import GlossaryCard from "@/components/view/glossary/GlossaryCard";
import InfoModal from "@/components/view/basic-modals/InfoModal";
import MiniGameModal from "@/components/view/minigames/MiniGameModal";
import MusicPlayerModal from "@/components/view/jukebox/MusicPlayerModal";
import SettingsModal from "@/components/view/utility-modals/SettingsModal";
import VideoModal from "@/components/view/utility-modals/VideoModal";
import { GlossaryProvider } from "@/contexts/GlossaryContext";
import { useViewStore } from "@/store/viewStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { Dice6, Disc3, Info, Palette, Settings } from "lucide-react";
import SpoilerModal from "@/components/view/basic-modals/SpoilerModal";
import { useTranslations } from "next-intl";

interface ItemsAppProps {
    bgImage: string;
}

const GlossaryApp = ({ bgImage }: ItemsAppProps) => {
    const tNavTooltips = useTranslations("navTooltips");

    // UI
    const openModal = useViewStore((state) => state.modal.openModal);
    const openInfoModal = useViewStore((state) => state.modal.openInfoModal);
    const openSettingsModal = useViewStore(
        (state) => state.modal.openSettingsModal,
    );
    const openMinigameModal = useViewStore(
        (state) => state.modal.openMinigameModal,
    );
    const openMusicPlayerModal = useViewStore(
        (state) => state.modal.openMusicPlayerModal,
    );
    const openFanartModal = useViewStore(
        (state) => state.modal.openFanartModal,
    );
    const closeModal = useViewStore((state) => state.modal.closeModal);
    const videoUrl = useViewStore((state) => state.modal.videoUrl);

    // Data
    const chapter = useViewStore((state) => state.data.chapter);
    const day = useViewStore((state) => state.data.day);

    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <GlossaryProvider>
                <GlossaryCard
                    className="md:max-w-[900px] w-[95vw] mt-8 sm:mt-2"
                    bgImage={bgImage}
                />
            </GlossaryProvider>

            <SpoilerModal />

            {/* Updated modal pattern to match ViewApp */}
            <InfoModal open={openModal === "info"} onClose={closeModal} />

            <SettingsModal
                open={openModal === "settings"}
                onClose={closeModal}
            />

            <MiniGameModal
                open={openModal === "minigame"}
                onClose={closeModal}
            />

            <VideoModal
                open={openModal === "video"}
                onClose={closeModal}
                videoUrl={videoUrl}
                bgImage={bgImage}
            />

            <MusicPlayerModal
                open={openModal === "music"}
                onClose={closeModal}
            />

            <FanartModal
                open={openModal === "fanart"}
                onClose={closeModal}
                chapter={chapter}
                day={day}
            />

            <div className="fixed top-0 right-0 m-[8px] z-10 flex md:flex-col gap-[8px]">
                <IconButton
                    id="info-btn"
                    className="size-[40px] p-[4px] hidden md:block"
                    tooltipText={tNavTooltips("info")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openInfoModal}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="size-[40px] p-[4px]"
                    tooltipText={tNavTooltips("settings")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openSettingsModal}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="size-[40px] p-[4px] hidden md:block"
                    tooltipText={tNavTooltips("minigames")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openMinigameModal}
                >
                    <Dice6 />
                </IconButton>

                <IconButton
                    id="music-player-btn"
                    className="size-[40px] p-[4px]"
                    tooltipText={tNavTooltips("jukebox")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openMusicPlayerModal}
                >
                    <Disc3 />
                </IconButton>

                <IconButton
                    id="fanart-btn"
                    className="size-[40px] p-1"
                    tooltipText={tNavTooltips("libestalGallery")}
                    enabled={true}
                    tooltipSide="left"
                    onClick={openFanartModal}
                >
                    <Palette />
                </IconButton>
            </div>
        </div>
    );
};

export default GlossaryApp;
