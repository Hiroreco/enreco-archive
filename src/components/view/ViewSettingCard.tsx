import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VaulDrawer from "@/components/view/VaulDrawer";
import ViewCard from "@/components/view/ViewCard";
import ViewRecapCard from "@/components/view/ViewRecapCard";
import ViewVisibilityCard from "@/components/view/ViewVisibilityCard";
import { useEscapeCard } from "@/hooks/useEscapeCard";
import { Chapter, ChartData, StringToBooleanObjectMap } from "@/lib/type";
import { cn, getViewportSize } from "@/lib/utils";
import { useState } from "react";
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
    day: number;
    onDayChange: (newDay: number) => void;
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
    day,
    onDayChange,
}: Props) => {
    useEscapeCard({ isCardOpen, onCardClose });
    function onDrawerOpenChange(newOpenState: boolean): void {
        if (!newOpenState) {
            onCardClose();
        }
    }

    const handleCardWidthChange = (width: number) => {
        if (isCardOpen && getViewportSize().label === "lg") {
            setChartShrink(width + 56); // Add 56px for the right margin (14 * 4)
        }
    };

    // On mobile, you can still scroll even if the drawer isn't open fully
    // So to only allow scrolling when the drawer is fully open, we need to track that state
    // Only need to to this for this card, because this card has a fixed tab header
    const [drawerOpenFully, setDrawerOpenFully] = useState(false);

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
                                day={day}
                                numberOfDays={chapterData.numberOfDays}
                                onDayChange={onDayChange}
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
                    onOpenFullyChange={setDrawerOpenFully}
                    disableScrollablity={true}
                >
                    <Tabs defaultValue="general">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="visibility">Edge</TabsTrigger>
                        </TabsList>
                        <TabsContent
                            value="general"
                            className="h-[80vh] pb-[10vh] overflow"
                        >
                            <ViewRecapCard
                                drawerOpenFully={drawerOpenFully}
                                dayData={dayData}
                                onEdgeLinkClicked={() => {}}
                                onNodeLinkClicked={() => {}}
                                day={day}
                                numberOfDays={chapterData.numberOfDays}
                                onDayChange={onDayChange}
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
                                drawerOpenFully={drawerOpenFully}
                            />
                        </TabsContent>
                    </Tabs>
                </VaulDrawer>
            </MobileView>
        </>
    );
};

export default ViewSettingCard;
