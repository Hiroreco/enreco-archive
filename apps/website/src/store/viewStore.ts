import {
    FixedEdgeType,
    ImageNodeType,
    RelationshipMap,
    TeamMap,
} from "@enreco-archive/common/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type CardType = "node" | "edge" | "setting" | null;
export type ModalType =
    | "info"
    | "settings"
    | "minigame"
    | "chapterRecap"
    | "video"
    | "fanart"
    | null;

interface ViewState {
    data: {
        chapter: number;
        setChapter: (chapter: number) => void;

        day: number;
        setDay: (day: number) => void;
    };

    ui: {
        currentCard: CardType;
        openNodeCard: () => void;
        openEdgeCard: () => void;
        openSettingsCard: () => void;
        closeCard: () => void;

        selectedElement: ImageNodeType | FixedEdgeType | null;
        selectElement: (element: ImageNodeType | FixedEdgeType) => void;
        deselectElement: () => void;
    };

    visibility: {
        relationship: { [key: string]: boolean };
        toggleRelationship: (
            relationshipId: string,
            relationshipVisibility: boolean,
        ) => void;
        toggleAllRelationships: (relationshipVisibility: boolean) => void;
        setRelationshipKeys: (relationships: RelationshipMap) => void;

        showOnlyNewEdges: boolean;
        setShowOnlyNewEdges: (showOnlyNewEdges: boolean) => void;

        team: { [key: string]: boolean };
        toggleTeam: (teamId: string, teamVisibility: boolean) => void;
        toggleAllTeams: (teamVisibility: boolean) => void;
        setTeamKeys: (teams: TeamMap) => void;

        character: { [key: string]: boolean };
        toggleCharacter: (
            characterId: string,
            characterVisibility: boolean,
        ) => void;
        toggleAllCharacters: (characterVisibility: boolean) => void;
        setCharacterKeys: (nodes: ImageNodeType[]) => void;
    };

    modal: {
        openModal: ModalType;
        openInfoModal: () => void;
        openSettingsModal: () => void;
        openMinigameModal: () => void;
        openChapterRecapModal: () => void;
        openVideoModal: () => void;
        openFanartModal: () => void;
        closeModal: () => void;
        videoUrl: string | null;
        setVideoUrl: (currentVideoUrl: string | null) => void;
    };
}

export const useViewStore = create<ViewState>()(
    immer((set, get) => {
        const [initialChapter, initialDay] = [0, 0];

        return {
            data: {
                chapter: initialChapter,
                setChapter: (chapter) =>
                    set((draft) => {
                        draft.data.chapter = chapter;
                    }),

                day: initialDay,
                setDay: (day) =>
                    set((draft) => {
                        draft.data.day = day;
                    }),
            },

            ui: {
                currentCard: null,
                openNodeCard: () =>
                    set((draft) => {
                        draft.ui.currentCard = "node";
                    }),
                openEdgeCard: () =>
                    set((draft) => {
                        draft.ui.currentCard = "edge";
                    }),
                openSettingsCard: () =>
                    set((draft) => {
                        draft.ui.currentCard = "setting";
                    }),
                closeCard: () =>
                    set((draft) => {
                        draft.ui.currentCard = null;
                    }),

                selectedElement: null,
                selectElement: (element) =>
                    set((draft) => {
                        draft.ui.selectedElement = element;
                    }),
                deselectElement: () =>
                    set((draft) => {
                        draft.ui.selectedElement = null;
                    }),
            },

            visibility: {
                relationship: {},
                toggleRelationship: (relationshipId, relationshipVisibility) =>
                    set((draft) => {
                        draft.visibility.relationship[relationshipId] =
                            relationshipVisibility;
                    }),
                toggleAllRelationships: (relationshipVisibility) =>
                    set((draft) => {
                        const keys = Object.keys(get().visibility.relationship);

                        for (const key of keys) {
                            draft.visibility.relationship[key] =
                                relationshipVisibility;
                        }
                    }),
                setRelationshipKeys: (relationships) =>
                    set((draft) => {
                        const keys = Object.keys(relationships);

                        const newRelationshipVisibility: {
                            [key: string]: boolean;
                        } = {};
                        for (const key of keys) {
                            newRelationshipVisibility[key] = true;
                        }

                        draft.visibility.relationship =
                            newRelationshipVisibility;
                    }),

                showOnlyNewEdges: true,
                setShowOnlyNewEdges: (showOnlyNewEdges) =>
                    set((draft) => {
                        draft.visibility.showOnlyNewEdges = showOnlyNewEdges;
                    }),

                team: {},
                toggleTeam: (teamId, teamVisibility) =>
                    set((draft) => {
                        draft.visibility.team[teamId] = teamVisibility;
                    }),
                toggleAllTeams: (teamVisibility: boolean) =>
                    set((draft) => {
                        const keys = Object.keys(get().visibility.team);

                        for (const key of keys) {
                            draft.visibility.team[key] = teamVisibility;
                        }
                    }),
                setTeamKeys: (teams: TeamMap) =>
                    set((draft) => {
                        const keys = Object.keys(teams);

                        const newTeamVisibility: { [key: string]: boolean } =
                            {};
                        for (const key of keys) {
                            newTeamVisibility[key] = true;
                        }

                        draft.visibility.team = newTeamVisibility;
                    }),

                character: {},
                toggleCharacter: (characterId, characterVisibility) =>
                    set((draft) => {
                        draft.visibility.character[characterId] =
                            characterVisibility;
                    }),
                toggleAllCharacters: (characterVisibility: boolean) =>
                    set((draft) => {
                        const keys = Object.keys(get().visibility.character);

                        for (const key of keys) {
                            draft.visibility.character[key] =
                                characterVisibility;
                        }
                    }),
                setCharacterKeys: (nodes: ImageNodeType[]) =>
                    set((draft) => {
                        const keys = nodes.map((n) => n.id);

                        const newCharacterVisibility: {
                            [key: string]: boolean;
                        } = {};
                        for (const key of keys) {
                            newCharacterVisibility[key] = true;
                        }

                        draft.visibility.character = newCharacterVisibility;
                    }),
            },

            modal: {
                openModal: null,
                openInfoModal: () =>
                    set((draft) => {
                        draft.modal.openModal = "info";
                    }),
                openSettingsModal: () =>
                    set((draft) => {
                        draft.modal.openModal = "settings";
                    }),
                openMinigameModal: () =>
                    set((draft) => {
                        draft.modal.openModal = "minigame";
                    }),
                openChapterRecapModal: () =>
                    set((draft) => {
                        draft.modal.openModal = "chapterRecap";
                    }),
                openVideoModal: () =>
                    set((draft) => {
                        draft.modal.openModal = "video";
                    }),
                openFanartModal: () =>
                    set((draft) => {
                        console.log("Opening fanart modal");
                        console.trace(); // This will show you the call stack
                        draft.modal.openModal = "fanart";
                    }),
                closeModal: () =>
                    set((draft) => {
                        console.log("Closing modal");
                        draft.modal.openModal = null;
                    }),

                videoUrl: null,
                setVideoUrl: (videoUrl) =>
                    set((draft) => {
                        draft.modal.videoUrl = videoUrl;
                    }),
            },
        };
    }),
);
