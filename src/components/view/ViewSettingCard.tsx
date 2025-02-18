import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VaulDrawer from "@/components/view/VaulDrawer";
import ViewCard from "@/components/view/ViewCard";
import ViewRecapCard from "@/components/view/ViewRecapCard";
import ViewVisibilityCard from "@/components/view/ViewVisibilityCard";
import { Chapter, ChartData, StringToBooleanObjectMap } from "@/lib/type";
import { cn } from "@/lib/utils";
import { BrowserView, MobileView } from "react-device-detect";

interface Props {
    isCardOpen: boolean;
    onCardClose: () => void;
    chapterData: Chapter;
    dayData: ChartData;
    edgeVisibility: StringToBooleanObjectMap;
    onEdgeVisibilityChange: (
        newEdgeVisibility: StringToBooleanObjectMap,
    ) => void;
    teamVisibility: StringToBooleanObjectMap;
    onTeamVisibilityChange: (
        newTeamVisibility: StringToBooleanObjectMap,
    ) => void;
    characterVisibility: { [key: string]: boolean };
    onCharacterVisibilityChange: (
        newCharacterVisibility: StringToBooleanObjectMap,
    ) => void;
    setChartShrink: (width: number) => void;
}

const ViewSettingCard = ({
    isCardOpen,
    onCardClose,
    chapterData,
    dayData,
    edgeVisibility,
    onEdgeVisibilityChange,
    teamVisibility,
    onTeamVisibilityChange,
    characterVisibility,
    onCharacterVisibilityChange,
    setChartShrink,
}: Props) => {
    function onDrawerOpenChange(newOpenState: boolean): void {
        if (!newOpenState) {
            onCardClose();
        }
    }

    const handleCardWidthChange = (width: number) => {
        if (isCardOpen) {
            setChartShrink(width + 56); // Add 56px for the right margin (14 * 4)
        }
    };


    return (
        <>
            <BrowserView>
                <ViewCard
                    onWidthChange={handleCardWidthChange}
                    isCardOpen={isCardOpen}
                    className={cn("transition-all absolute p-0 z-10", {
                        "opacity-0 invisible": !isCardOpen,
                        "opacity-1 visible": isCardOpen,
                    })}
                >
                    <Tabs
                        defaultValue="general"
                        className="w-full h-[calc(100%-3.5rem)]"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">Day Recap</TabsTrigger>
                            <TabsTrigger value="visibility">
                                Chart Visibility
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="h-full">
                            <ViewRecapCard
                                dayData={dayData}
                                onEdgeLinkClicked={() => {}}
                                onNodeLinkClicked={() => {}}
                            />
                        </TabsContent>
                        <TabsContent value="visibility" className="h-full">
                            <ViewVisibilityCard
                                edgeVisibility={edgeVisibility}
                                onEdgeVisibilityChange={onEdgeVisibilityChange}
                                teamVisibility={teamVisibility}
                                onTeamVisibilityChange={onTeamVisibilityChange}
                                characterVisibility={characterVisibility}
                                onCharacterVisibilityChange={
                                    onCharacterVisibilityChange
                                }
                                chapterData={chapterData}
                                nodes={dayData.nodes}
                            />
                        </TabsContent>
                    </Tabs>
                </ViewCard>
            </BrowserView>
            <MobileView>
                <VaulDrawer
                    open={isCardOpen}
                    onOpenChange={onDrawerOpenChange}
                    disableScrollablity={true}
                >
                    <Tabs defaultValue="general">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="visibility">Edge</TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="general"
                            className="h-[80vh] pb-[10vh]"
                        >
                            <ViewRecapCard
                                dayData={dayData}
                                onEdgeLinkClicked={() => {}}
                                onNodeLinkClicked={() => {}}
                            />
                        </TabsContent>
                        <TabsContent
                            value="visibility"
                            className="h-[80vh] pb-[10vh]"
                        >
                            <ViewVisibilityCard
                                edgeVisibility={edgeVisibility}
                                onEdgeVisibilityChange={onEdgeVisibilityChange}
                                teamVisibility={teamVisibility}
                                onTeamVisibilityChange={onTeamVisibilityChange}
                                characterVisibility={characterVisibility}
                                onCharacterVisibilityChange={
                                    onCharacterVisibilityChange
                                }
                                chapterData={chapterData}
                                nodes={dayData.nodes}
                            />
                        </TabsContent>
                    </Tabs>
                </VaulDrawer>
            </MobileView>
        </>
    );
};

export default ViewSettingCard;
