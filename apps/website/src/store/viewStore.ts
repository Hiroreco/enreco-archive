import { FixedEdgeType, ImageNodeType, TeamMap } from "@enreco-archive/common/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer"; 

export type CardType = "node" | "edge" | "setting" | null;
export type ModalType = "info" | "settings" | "minigame" | "chapterRecap" | "video" | null;

interface ViewState {
    data: {
        chapter: number;
        setChapter: (chapter: number) => void;

        day: number;
        setDay: (day: number) => void;
    },

    ui: {
        currentCard: CardType;
        openNodeCard: () => void;
        openEdgeCard: () => void;
        openSettingsCard: () => void;
        closeCard: () => void;

        selectedNode: ImageNodeType | null;
        selectNode: (node: ImageNodeType) => void;
        clearSelectedNode: () => void;

        selectedEdge: FixedEdgeType | null;
        selectEdge: (edge: FixedEdgeType) => void;
        clearSelectedEdge: () => void;
    },

    visibility: {
        edge: { [key: string]: boolean };
        toggleEdge: (edgeId: string, edgeVisibility: boolean) => void;
        toggleAllEdges: (edgeVisibility: boolean) => void;
        setEdgeKeys: (edges: FixedEdgeType[]) => void;

        showOnlyNewEdges: boolean;
        setShowOnlyNewEdges: (showOnlyNewEdges: boolean) => void;

        team: { [key: string]: boolean };
        toggleTeam: (teamId: string, teamVisibility: boolean) => void;
        toggleAllTeams: (teamVisibility: boolean) => void;
        setTeamKeys: (teams: TeamMap) => void;

        character: { [key: string]: boolean };
        toggleCharacter: (characterId: string, characterVisibility: boolean) => void;
        toggleAllCharacters: (characterVisibility: boolean) => void;
        setCharacterKeys: (nodes: ImageNodeType[]) => void;
    },

    modal: {
        openModal: ModalType;
        openInfoModal: () => void;
        openSettingsModal: () => void;
        openMinigameModal: () => void;
        openChapterRecapModal: () => void;
        openVideoModal: () => void;
        closeModal: () => void;
        isInfoModalOpen: () => boolean;
        isSettingsModalOpen: () => boolean;
        isMinigameModalOpen: () => boolean;
        isChapterRecapModalOpen: () => boolean;
        isVideoModalOpen: () => boolean;

        videoUrl: string | null;
        setVideoUrl: (currentVideoUrl: string | null) => void;
    }
}

export const useViewStore = create<ViewState>()(immer((set, get) => {
    const [initialChapter, initialDay] = [0, 0];

    return {
        data: {
            chapter: initialChapter,
            setChapter: (chapter) => set(draft => { draft.data.chapter = chapter; }),

            day: initialDay,
            setDay: (day) => set(draft => { draft.data.day = day; }),
        },

        ui: {
            currentCard: null,
            openNodeCard: () => set(draft => { draft.ui.currentCard = "node"; }),
            openEdgeCard: () => set(draft => { draft.ui.currentCard = "edge"; }),
            openSettingsCard: () => set(draft => { draft.ui.currentCard = "setting"; }),
            closeCard: () => set(draft => { draft.ui.currentCard = null; }),

            selectedNode: null,
            selectNode: (node: ImageNodeType) => 
                set(draft => { draft.ui.selectedNode = node; }),
            clearSelectedNode: () => 
                set(draft => { draft.ui.selectedNode = null; }),

            selectedEdge: null,
            selectEdge: (edge: FixedEdgeType) =>
                set(draft => { draft.ui.selectedEdge = edge; }),
            clearSelectedEdge: () => 
                set(draft => { draft.ui.selectedEdge = null; }),
        },

        visibility: {
            edge: {},
            toggleEdge: (edgeId, edgeVisibility) => 
                set(draft => { draft.visibility.edge[edgeId] = edgeVisibility; }),
            toggleAllEdges: (edgeVisibility) => 
                set(draft => {
                    const keys = Object.keys(get().visibility.edge);

                    for(const key of keys) {
                        draft.visibility.edge[key] = edgeVisibility;
                    }
                }),
            setEdgeKeys: (edges) => 
                set(draft => {
                    const keys = edges.map(e => e.id);

                    const newEdgeVisibility: { [key: string]: boolean } = {};
                    for(const key of keys) {
                        newEdgeVisibility[key] = true;
                    }

                    draft.visibility.edge = newEdgeVisibility;
                }),

            showOnlyNewEdges: true,
            setShowOnlyNewEdges: (showOnlyNewEdges) => 
                set(draft => { draft.visibility.showOnlyNewEdges = showOnlyNewEdges; }),

            team: {},
            toggleTeam: (teamId, teamVisibility) => 
                set(draft => { draft.visibility.team[teamId] = teamVisibility; }),
            toggleAllTeams: (teamVisibility: boolean) => 
                set(draft => {
                    const keys = Object.keys(get().visibility.team);

                    for(const key of keys) {
                        draft.visibility.team[key] = teamVisibility;
                    }
                }),
            setTeamKeys: (teams: TeamMap) => 
                set(draft => {
                    const keys = Object.keys(teams);

                    const newTeamVisibility: { [key: string]: boolean } = {};
                    for(const key of keys) {
                        newTeamVisibility[key] = true;
                    }

                    draft.visibility.team = newTeamVisibility;
                }),

            character: {},
            toggleCharacter: (characterId, characterVisibility) =>
                set(draft => { draft.visibility.character[characterId] = characterVisibility; }),
            toggleAllCharacters: (characterVisibility: boolean) => 
                set(draft => {
                    const keys = Object.keys(get().visibility.character);

                    for(const key of keys) {
                        draft.visibility.character[key] = characterVisibility;
                    }
                }),
            setCharacterKeys: (nodes: ImageNodeType[]) => 
                set(draft => {
                    const keys = nodes.map(n => n.id);

                    const newCharacterVisibility: { [key: string]: boolean } = {};
                    for(const key of keys) {
                        newCharacterVisibility[key] = true;
                    }

                    draft.visibility.character = newCharacterVisibility;
                }),
        },

        modal: {
            openModal: null,
            openInfoModal: () => set(draft => { draft.modal.openModal = "info"; }),
            openSettingsModal: () => set(draft => { draft.modal.openModal = "settings"; }),
            openMinigameModal: () => set(draft => { draft.modal.openModal = "minigame"; }),
            openChapterRecapModal: () => set(draft => { draft.modal.openModal = "chapterRecap"; }),
            openVideoModal: () => set(draft => { draft.modal.openModal = "video"; }),
            closeModal: () => set(draft => { draft.modal.openModal = null; }),
            isInfoModalOpen: () => get().modal.openModal === "info",
            isChapterRecapModalOpen: () => get().modal.openModal === "chapterRecap",
            isMinigameModalOpen: () => get().modal.openModal === "minigame",
            isSettingsModalOpen: () => get().modal.openModal === "settings",
            isVideoModalOpen: () => get().modal.openModal === "video",

            videoUrl: null,
            setVideoUrl: (videoUrl) => set(draft => { draft.modal.videoUrl = videoUrl; }),
        }
    };
}));
