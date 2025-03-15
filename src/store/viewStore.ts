import { FixedEdgeType, ImageNodeType } from "@/lib/type";
import { create } from "zustand";
export type CardType = "node" | "edge" | "setting" | null;

interface ViewState {
    chapter: number;
    setChapter: (chapter: number) => void;

    day: number;
    setDay: (day: number) => void;

    previousSelectedDay: number;
    setPreviousSelectedDay: (previousSelectedDay: number) => void;

    currentCard: CardType;
    setCurrentCard: (name: CardType) => void;

    edgeVisibility: { [key: string]: boolean };
    setEdgeVisibility: (edgeVisibility: { [key: string]: boolean }) => void;

    teamVisibility: { [key: string]: boolean };
    setTeamVisibility: (teamVisibility: { [key: string]: boolean }) => void;

    characterVisibility: { [key: string]: boolean };
    setCharacterVisibility: (characterVisibility: {
        [key: string]: boolean;
    }) => void;

    infoModalOpen: boolean;
    setInfoModalOpen: (isInfoModalOpen: boolean) => void;

    settingsModalOpen: boolean;
    setSettingsModalOpen: (isSettingsModalOpen: boolean) => void;

    minigameModalOpen: boolean;
    setMinigameModalOpen: (isMinigameModalOpen: boolean) => void;

    videoModalOpen: boolean;
    setVideoModalOpen: (isVideoModalOpen: boolean) => void;

    videoUrl: string | null;
    setVideoUrl: (currentVideoUrl: string | null) => void;

    hoveredEdgeId: string | null;
    setHoveredEdgeId: (hoveredEdgeId: string) => void;

    selectedNode: ImageNodeType | null;
    setSelectedNode: (node: ImageNodeType | null) => void;

    selectedEdge: FixedEdgeType | null;
    setSelectedEdge: (edge: FixedEdgeType | null) => void;
}
export const useViewStore = create<ViewState>((set) => {
    const [initialChapter, initialDay] = [0, 0];

    return {
        chapter: initialChapter,
        setChapter: (chapter: number) => set(() => ({ chapter })),

        day: initialDay,
        setDay: (day: number) => set(() => ({ day })),

        previousSelectedDay: initialDay,
        setPreviousSelectedDay: (previousSelectedDay: number) =>
            set(() => ({ previousSelectedDay })),

        currentCard: null,
        setCurrentCard: (currentCard: CardType) => set(() => ({ currentCard })),

        edgeVisibility: {},
        setEdgeVisibility: (edgeVisibility: { [key: string]: boolean }) =>
            set(() => ({ edgeVisibility })),

        teamVisibility: {},
        setTeamVisibility: (teamVisibility: { [key: string]: boolean }) =>
            set(() => ({ teamVisibility })),

        characterVisibility: {},
        setCharacterVisibility: (characterVisibility: {
            [key: string]: boolean;
        }) => set(() => ({ characterVisibility })),

        infoModalOpen: false,
        setInfoModalOpen: (isInfoModalOpen: boolean) =>
            set(() => ({ infoModalOpen: isInfoModalOpen })),

        settingsModalOpen: false,
        setSettingsModalOpen: (isSettingsModalOpen: boolean) =>
            set(() => ({ settingsModalOpen: isSettingsModalOpen })),

        minigameModalOpen: false,
        setMinigameModalOpen: (isMinigameModalOpen: boolean) =>
            set(() => ({ minigameModalOpen: isMinigameModalOpen })),

        videoModalOpen: false,
        setVideoModalOpen: (isVideoModalOpen: boolean) =>
            set(() => ({ videoModalOpen: isVideoModalOpen })),

        videoUrl: null,
        setVideoUrl: (videoUrl: string | null) => set(() => ({ videoUrl })),

        hoveredEdgeId: null,
        setHoveredEdgeId: (hoveredEdgeId: string) =>
            set(() => ({ hoveredEdgeId })),

        selectedNode: null,
        setSelectedNode: (node: ImageNodeType | null) =>
            set(() => ({ selectedNode: node })),

        selectedEdge: null,
        setSelectedEdge: (edge: FixedEdgeType | null) =>
            set(() => ({ selectedEdge: edge })),
    };
});
