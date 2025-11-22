import {
    FixedEdgeType,
    ImageNodeType,
    RelationshipMap,
    TeamMap,
} from "@enreco-archive/common/types";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

export type CardType = "node" | "edge" | "setting" | null;
export type ModalType =
    | "info"
    | "settings"
    | "minigame"
    | "chapterRecap"
    | "video"
    | "fanart"
    | "music"
    | "read-counter"
    | "changelog"
    | null;

type ViewStoreType = ViewDataSlice & ViewUiSlice & ViewVisibilitySlice & ViewModalSlice;

/** Slice to hold important app data. */
interface ViewDataSlice {
    chapter: number;
    setChapter: (chapter: number) => void;

    day: number;
    setDay: (day: number) => void;
}

const createDataSlice: StateCreator<
    ViewStoreType,
    [],
    [],
    ViewDataSlice
> = (set) => ({
    chapter: 0,
    setChapter: (newChapter) => set(() => ({ chapter: newChapter })),

    day: 0,
    setDay: (newDay) => set(() => ({ day: newDay })),
});

/** Slice to hold various ui state. */
interface ViewUiSlice {
    currentCard: CardType;
    openNodeCard: () => void;
    openEdgeCard: () => void;
    openSettingsCard: () => void;
    closeCard: () => void;

    selectedElement: ImageNodeType | FixedEdgeType | null;
    selectElement: (element: ImageNodeType | FixedEdgeType) => void;
    deselectElement: () => void;
}

const createUiSlice: StateCreator<
    ViewStoreType,
    [],
    [],
    ViewUiSlice
> = (set) => ({
    currentCard: null,
    openNodeCard: () => set(() => ({ currentCard: "node" })),
    openEdgeCard: () => set(() => ({ currentCard: "edge" })),
    openSettingsCard: () => set(() => ({ currentCard: "setting" })),
    closeCard: () => set(() => ({ currentCard: null })),

    selectedElement: null,
    selectElement: (element) => set(() => ({ selectedElement: element })),
    deselectElement: () => set(() => ({ selectedElement: null })),
});

/** Slice to hold the visibility of various elements of the relationship chart. */
interface ViewVisibilitySlice {
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
}

const createVisibilitySlice: StateCreator<
    ViewStoreType,
    [["zustand/immer", never]],
    [],
    ViewVisibilitySlice
> = (set) => ({
    relationship: {},
    toggleRelationship: (relationshipId, relationshipVisibility) =>
        set((draft) => {
            draft.relationship[relationshipId] =
                relationshipVisibility;
        }),
    toggleAllRelationships: (relationshipVisibility) =>
        set((draft) => {
            const keys = Object.keys(draft.relationship);

            for (const key of keys) {
                draft.relationship[key] =
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

            draft.relationship =
                newRelationshipVisibility;
        }),

    showOnlyNewEdges: true,
    setShowOnlyNewEdges: (showOnlyNewEdges) =>
        set((draft) => {
            draft.showOnlyNewEdges = showOnlyNewEdges;
        }),

    team: {},
    toggleTeam: (teamId, teamVisibility) =>
        set((draft) => {
            draft.team[teamId] = teamVisibility;
        }),
    toggleAllTeams: (teamVisibility: boolean) =>
        set((draft) => {
            const keys = Object.keys(draft.team);

            for (const key of keys) {
                draft.team[key] = teamVisibility;
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

            draft.team = newTeamVisibility;
        }),

    character: {},
    toggleCharacter: (characterId, characterVisibility) =>
        set((draft) => {
            draft.character[characterId] =
                characterVisibility;
        }),
    toggleAllCharacters: (characterVisibility: boolean) =>
        set((draft) => {
            const keys = Object.keys(draft.character);

            for (const key of keys) {
                draft.character[key] =
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

            draft.character = newCharacterVisibility;
        }),
});

/** Slice to hold the state of which modal is open. */
interface ViewModalSlice {
    openModal: ModalType;
    openInfoModal: () => void;
    openSettingsModal: () => void;
    openMinigameModal: () => void;
    openChapterRecapModal: () => void;
    openVideoModal: () => void;
    openFanartModal: () => void;
    openMusicPlayerModal: () => void;
    openReadCounterModal: () => void;
    openChangeLogModal: () => void;
    closeModal: () => void;
    videoUrl: string | null;
    setVideoUrl: (currentVideoUrl: string | null) => void;
}

const createModalSlice: StateCreator<
    ViewStoreType,
    [],
    [],
    ViewModalSlice
> = (set) => ({
    openModal: null,
    openInfoModal: () => set(() => ({ openModal: "info" })),
    openSettingsModal: () => set(() => ({ openModal: "settings" })),
    openMinigameModal: () => set(() => ({ openModal: "minigame" })),
    openChapterRecapModal: () => set(() => ({ openModal: "chapterRecap" })),
    openVideoModal: () => set(() => ({ openModal: "video" })),
    openFanartModal: () => set(() => ({ openModal: "fanart" })),
    openMusicPlayerModal: () => set(() => ({ openModal: "music" })),
    openReadCounterModal: () => set(() => ({ openModal: "read-counter" })),

    openChangeLogModal: () => set(() => ({ openModal: "changelog" })),
    closeModal: () => set(() => ({ openModal: null })),

    videoUrl: null,
    setVideoUrl: (videoUrl) => set(() => ({ videoUrl: videoUrl })),
});

export const useViewStore = create<ViewStoreType>()(
    immer(
        (...a) => ({
        ...createDataSlice(...a),
        ...createUiSlice(...a),
        ...createVisibilitySlice(...a),
        ...createModalSlice(...a)
    })
));
