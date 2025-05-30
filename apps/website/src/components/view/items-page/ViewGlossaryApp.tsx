import ViewGlossaryCard from "@/components/view/items-page/ViewGlossaryCard";
import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewSettingsModal from "@/components/view/ViewSettingsModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { useViewStore } from "@/store/viewStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { Dice6, Info, Settings } from "lucide-react";

interface ViewItemsAppProps {
    bgImage: string;
}

const ViewGlossaryApp = ({ bgImage }: ViewItemsAppProps) => {
    const viewStore = useViewStore();

    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <h1>Glossary</h1>
            <ViewGlossaryCard className="h-[80dvh] max-w-[900px] mx-auto mt-2" />

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

            <div className="fixed top-0 right-0 m-2 z-10 flex flex-col gap-2">
                <IconButton
                    id="info-btn"
                    className="h-10 w-10 p-1"
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
                    className="h-10 w-10 p-1"
                    tooltipText="Minigames"
                    enabled={true}
                    tooltipSide="left"
                    onClick={() => viewStore.setMinigameModalOpen(true)}
                >
                    <Dice6 />
                </IconButton>
            </div>
        </div>
    );
};

export default ViewGlossaryApp;
