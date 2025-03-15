import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VaulDrawer from "@/components/view/VaulDrawer";
import ViewRecapCard from "@/components/view/ViewRecapCard";
import ViewVisibilityCard from "@/components/view/ViewVisibilityCard";
import { Chapter, ChartData, StringToBooleanObjectMap } from "@/lib/type";
import { isMobileViewport } from "@/lib/utils";

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
    function onDrawerOpenChange(newOpenState: boolean): void {
        if (!newOpenState) {
            onCardClose();
        }
    }

    const handleCardWidthChange = (width: number) => {
        if (isCardOpen && !isMobileViewport()) {
            setChartShrink(width + 56); // Add 56px for the right margin (14 * 4)
        }
    };

    return (
        <VaulDrawer
            open={isCardOpen}
            onOpenChange={onDrawerOpenChange}
            onWidthChange={handleCardWidthChange}
            disableScrollablity={false}
        >
            <Tabs defaultValue="general" className="flex flex-col h-full">
                <TabsList className="flex-none grid w-full grid-cols-2">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="visibility">Edge</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="flex-1" asChild>
                    <ViewRecapCard
                        dayData={dayData}
                        onEdgeLinkClicked={() => {}}
                        onNodeLinkClicked={() => {}}
                        day={day}
                        numberOfDays={chapterData.numberOfDays}
                        onDayChange={onDayChange}
                    />
                </TabsContent>
                <TabsContent value="visibility" className="flex-1" asChild>
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
    );
};

export default ViewSettingCard;
