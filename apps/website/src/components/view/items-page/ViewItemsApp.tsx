import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewSettingsModal from "@/components/view/ViewSettingsModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { useViewStore } from "@/store/viewStore";
import { Dice6, Info, Settings } from "lucide-react";

import weapons from "#/glossary/weapons.json";
import hats from "#/glossary/hats.json";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import ViewItemsCard from "@/components/view/items-page/ViewItemsCard";

interface ViewItemsAppProps {
    bgImage: string;
}

const ViewItemsApp = ({ bgImage }: ViewItemsAppProps) => {
    const viewStore = useViewStore();

    return (
        <div className="w-screen h-dvh flex flex-col items-center justify-center overflow-hidden">
            <Tabs
                defaultValue="weapons"
                className="w-[80%] max-w-[900px] mx-auto flex flex-col"
            >
                <TabsList className="w-full bg-transparent">
                    <TabsTrigger value="weapons">Weapons</TabsTrigger>
                    <TabsTrigger value="hats">Hats</TabsTrigger>
                </TabsList>
                <TabsContent value="weapons">
                    <ViewItemsCard data={weapons} label="Weapons" />
                </TabsContent>
                <TabsContent value="hats">
                    <ViewItemsCard data={hats} label="Hats" />
                </TabsContent>
            </Tabs>

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

export default ViewItemsApp;
