import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import VaulDrawer from "@/components/view/chart-cards/VaulDrawer";
import ViewRecapCard from "@/components/view/chart-cards/ViewRecapCard";
import ViewVisibilityCard from "@/components/view/chart-cards/ViewVisibilityCard";
import {
    Chapter,
    ImageNodeType,
    StringToBooleanObjectMap,
} from "@enreco-archive/common/types";
import { isMobileViewport } from "@/lib/utils";

interface Props {
    isCardOpen: boolean;
    onCardClose: () => void;
    chapter: number;
    chapterData: Chapter;
    dayRecap: string;
    nodes: ImageNodeType[];
    relationshipVisibility: StringToBooleanObjectMap;
    toggleRelationshipVisible: (edgeId: string, visibility: boolean) => void;
    toggleAllRelationshipVisible: (visibility: boolean) => void;
    showOnlyNewEdges: boolean;
    setShowOnlyNewEdges: (newVal: boolean) => void;
    teamVisibility: StringToBooleanObjectMap;
    toggleTeamVisible: (teamId: string, visibility: boolean) => void;
    toggleAllTeamsVisible: (visibility: boolean) => void;
    characterVisibility: { [key: string]: boolean };
    toggleCharacterVisible: (characterId: string, visibility: boolean) => void;
    toggleAllCharactersVisible: (visibility: boolean) => void;
    setChartShrink: (width: number) => void;
    day: number;
    onDayChange: (newDay: number) => void;
}

const ViewDayRecapCard = ({
    isCardOpen,
    onCardClose,
    chapter,
    chapterData,
    dayRecap,
    nodes,
    relationshipVisibility,
    toggleRelationshipVisible,
    toggleAllRelationshipVisible,
    showOnlyNewEdges,
    setShowOnlyNewEdges,
    teamVisibility,
    toggleTeamVisible,
    toggleAllTeamsVisible,
    characterVisibility,
    toggleCharacterVisible,
    toggleAllCharactersVisible,
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
                    <TabsTrigger value="general">Summary</TabsTrigger>
                    <TabsTrigger value="visibility">Visibility</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="flex-1" asChild>
                    <ViewRecapCard
                        dayRecap={dayRecap}
                        onEdgeLinkClicked={() => {}}
                        onNodeLinkClicked={() => {}}
                        day={day}
                        numberOfDays={chapterData.numberOfDays}
                        onDayChange={onDayChange}
                    />
                </TabsContent>
                <TabsContent value="visibility" className="flex-1" asChild>
                    <ViewVisibilityCard
                        relationshipVisibility={relationshipVisibility}
                        toggleRelationshipVisible={toggleRelationshipVisible}
                        toggleAllRelationshipVisible={
                            toggleAllRelationshipVisible
                        }
                        showOnlyNewEdges={showOnlyNewEdges}
                        setShowOnlyNewEdges={setShowOnlyNewEdges}
                        teamVisibility={teamVisibility}
                        toggleTeamVisible={toggleTeamVisible}
                        toggleAllTeamsVisible={toggleAllTeamsVisible}
                        characterVisibility={characterVisibility}
                        toggleCharacterVisible={toggleCharacterVisible}
                        toggleAllCharactersVisible={toggleAllCharactersVisible}
                        chapter={chapter}
                        chapterData={chapterData}
                        nodes={nodes}
                    />
                </TabsContent>
            </Tabs>
        </VaulDrawer>
    );
};

export default ViewDayRecapCard;
