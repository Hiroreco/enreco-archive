import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconButton } from "@/components/ui/IconButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewInfoModal from "@/components/view/ViewInfoModal";
import ViewMiniGameModal from "@/components/view/ViewMiniGameModal";
import ViewSettingsModal from "@/components/view/ViewSettingsModal";
import ViewVideoModal from "@/components/view/ViewVideoModal";
import { useViewStore } from "@/store/viewStore";
import { Dice6, Info, Settings } from "lucide-react";

interface ViewItemsAppProps {
    bgImage: string;
}

const ViewItemsApp = ({ bgImage }: ViewItemsAppProps) => {
    const viewStore = useViewStore();

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center">
            {/* ViewItemsApp content here */}
            <Tabs
                defaultValue="weapons"
                className="w-[80%] h-[90%] mx-auto flex flex-col"
            >
                <TabsList className="w-full bg-transparent">
                    <TabsTrigger value="weapons">Weapons</TabsTrigger>
                    <TabsTrigger value="hats">Hats</TabsTrigger>
                </TabsList>
                <TabsContent value="weapons" className="flex-1">
                    <Card className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                        <CardHeader>
                            <CardTitle>Weapons</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-10 gap-4">
                                {Array.from({ length: 20 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="border-green-300 border backdrop-blur-md rounded-lg p-4 cursor-pointer hover:scale-105 transition-all"
                                    >
                                        <img
                                            className="w-[50px] h-auto mx-auto"
                                            src="https://i.pinimg.com/736x/69/de/e6/69dee631b78c61b06d8b1ce53a48c347.jpg"
                                            alt={`weapon-${index}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="hats" className="flex-1">
                    <Card className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                        <CardHeader>
                            <CardTitle>Hats</CardTitle>
                        </CardHeader>
                    </Card>
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
