import ViewGlossaryCard from "@/components/view/items-page/ViewGlossaryCard";
import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewMusicPlayerModal from "@/components/view/ViewMusicPlayerModal";
import ViewSettingsModal from "@/components/view/ViewSettingsModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { GlossaryProvider } from "@/contexts/GlossaryContext";
import { useMusicPlayerStore } from "@/store/musicPlayerStore";
import { useViewStore } from "@/store/viewStore";
import { useSettingStore } from "@/store/settingStore";
import { getTextSizeValue, getFontFamilyValue } from "@/store/uiSettings";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { Dice6, Info, Settings, Disc3 } from "lucide-react";

interface ViewItemsAppProps {
    bgImage: string;
}

const ViewGlossaryApp = ({ bgImage }: ViewItemsAppProps) => {
    const viewStore = useViewStore();
    const { isOpen: isMusicModalOpen, setIsOpen: setIsMusicModalOpen } =
        useMusicPlayerStore();

    const { textSize, fontFamily } = useSettingStore();
    const textSizeValue = getTextSizeValue(textSize);
    const fontFamilyValue = getFontFamilyValue(fontFamily);

    return (
        <div
            style={{
                ['--site-text-size' as any]: textSizeValue,
                fontFamily: fontFamilyValue,
            }}
            className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden site-text-size"
        >
            <GlossaryProvider>
                <ViewGlossaryCard className="md:max-w-[900px] w-[95vw] mt-8 sm:mt-2" />
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

            <div className="fixed top-0 right-0 m-2 z-10 flex md:flex-col gap-2">
                <IconButton
                    id="info-btn"
                    className="h-10 w-10 p-1 hidden md:block"
                    tooltipText="Info"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setInfoModalOpen(true)}
                >
                    <Info />
                </IconButton>

                <IconButton
                    id="settings-btn"
                    className="h-10 w-10 p-1"
                    tooltipText="Settings"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setSettingsModalOpen(true)}
                >
                    <Settings />
                </IconButton>

                <IconButton
                    id="minigames-btn"
                    className="h-10 w-10 p-1 hidden md:block"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setMinigameModalOpen(true)}
                >
                    <Dice6 />
                </IconButton>

                <IconButton
                    id="music-player-btn"
                    className="h-10 w-10 p-1"
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
