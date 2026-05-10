import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import RecapCard from "@/components/view/chart-cards/RecapCard";
import VisibilityCard from "@/components/view/chart-cards/VisibilityCard";
import { Chapter } from "@enreco-archive/common/types";
import { useTranslations } from "next-intl";
import { useViewStore } from "@/store/viewStore";
import { useShallow } from "zustand/react/shallow";
import { useCompleteChartData } from "@/hooks/data/useCompleteChartData";

interface Props {
    chapterData: Chapter;
    dayRecap: string;
    onDayChange: (newDay: number) => void;
}

const DayRecapCard = ({ chapterData, dayRecap, onDayChange }: Props) => {
    const t = useTranslations("cards.dayCard");

    const {
        chapter,
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
        day,
    } = useViewStore(
        useShallow((state) => ({
            chapter: state.chapter,
            relationshipVisibility: state.relationship,
            toggleRelationshipVisible: state.toggleRelationship,
            toggleAllRelationshipVisible: state.toggleAllRelationships,
            showOnlyNewEdges: state.showOnlyNewEdges,
            setShowOnlyNewEdges: state.setShowOnlyNewEdges,
            teamVisibility: state.team,
            toggleTeamVisible: state.toggleTeam,
            toggleAllTeamsVisible: state.toggleAllTeams,
            characterVisibility: state.character,
            toggleCharacterVisible: state.toggleCharacter,
            toggleAllCharactersVisible: state.toggleAllCharacters,
            day: state.day,
        })),
    );

    const { nodes } = useCompleteChartData();

    return (
        <Tabs defaultValue="general" className="flex flex-col h-full">
            <TabsList className="flex-none grid w-full grid-cols-2">
                <TabsTrigger value="general">{t("summary")}</TabsTrigger>
                <TabsTrigger value="visibility">{t("visibility")}</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="flex-1" asChild>
                <RecapCard
                    dayRecap={dayRecap}
                    day={day}
                    numberOfDays={chapterData.numberOfDays}
                    onDayChange={onDayChange}
                />
            </TabsContent>
            <TabsContent value="visibility" className="flex-1" asChild>
                <VisibilityCard
                    relationshipVisibility={relationshipVisibility}
                    toggleRelationshipVisible={toggleRelationshipVisible}
                    toggleAllRelationshipVisible={toggleAllRelationshipVisible}
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
    );
};

export default DayRecapCard;
