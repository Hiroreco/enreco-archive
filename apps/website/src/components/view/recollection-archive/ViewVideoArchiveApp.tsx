import ViewVideoArchiveCard from "@/components/view/recollection-archive/ViewVideoArchiveCard";
import { useViewStore } from "@/store/viewStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { Info, Settings, Dice6, Disc3, Palette } from "lucide-react";
import { useTranslations } from "next-intl";

interface ViewVideoArchiveAppProps {
    bgImage: string;
}

const ViewVideoArchiveApp = ({ bgImage }: ViewVideoArchiveAppProps) => {
    const tNavTooltips = useTranslations("navTooltips");

    // UI
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

    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <ViewVideoArchiveCard
                className="md:max-w-[1200px] w-[95vw] mt-8 sm:mt-2"
                bgImage={bgImage}
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

export default ViewVideoArchiveApp;
