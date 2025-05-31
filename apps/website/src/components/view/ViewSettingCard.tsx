import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import VaulDrawer from "@/components/view/VaulDrawer";
import ViewRecapCard from "@/components/view/ViewRecapCard";
import ViewVisibilityCard from "@/components/view/ViewVisibilityCard";
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
    edgeVisibility: StringToBooleanObjectMap;
    toggleEdgeVisible: (edgeId: string, visibility: boolean) => void;
    toggleAllEdgesVisible: (visibility: boolean) => void;
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

const ViewSettingCard = ({
    isCardOpen,
    onCardClose,
    chapter,
    chapterData,
    dayRecap,
    nodes,
    edgeVisibility,
    toggleEdgeVisible,
    toggleAllEdgesVisible,
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
                        edgeVisibility={edgeVisibility}
                        toggleEdgeVisible={toggleEdgeVisible}
                        toggleAllEdgesVisible={toggleAllEdgesVisible}
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

export default ViewSettingCard;
