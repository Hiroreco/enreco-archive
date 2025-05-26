import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";
import { create } from "zustand";
export type CardType = "node" | "edge" | "setting" | null;
export type ModalType = "info" | "settings" | "minigame" | "chapterRecap" | "video" | null;

interface ViewState {
    chapter: number;
    setChapter: (chapter: number) => void;

    day: number;
    setDay: (day: number) => void;

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

    openModal: ModalType;
    setOpenModal: (openModal: ModalType) => void;
    isInfoModalOpen: () => boolean;
    isSettingsModalOpen: () => boolean;
    isMinigameModalOpen: () => boolean;
    isChapterRecapModalOpen: () => boolean;
    isVideoModalOpen: () => boolean;

    videoUrl: string | null;
    setVideoUrl: (currentVideoUrl: string | null) => void;

    selectedNode: ImageNodeType | null;
    setSelectedNode: (node: ImageNodeType | null) => void;

    selectedEdge: FixedEdgeType | null;
    setSelectedEdge: (edge: FixedEdgeType | null) => void;
}
export const useViewStore = create<ViewState>((set, get) => {
    const [initialChapter, initialDay] = [0, 0];

    return {
        chapter: initialChapter,
        setChapter: (chapter: number) => set(() => ({ chapter })),

        day: initialDay,
        setDay: (day: number) => set(() => ({ day })),

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

        openModal: null,
        setOpenModal: (openModal: ModalType) => set(() => ({openModal})),
        isInfoModalOpen: () => get().openModal === "info",
        isChapterRecapModalOpen: () => get().openModal === "chapterRecap",
        isMinigameModalOpen: () => get().openModal === "minigame",
        isSettingsModalOpen: () => get().openModal === "settings",
        isVideoModalOpen: () => get().openModal === "video",

        videoUrl: null,
        setVideoUrl: (videoUrl: string | null) => set(() => ({ videoUrl })),

        selectedNode: null,
        setSelectedNode: (node: ImageNodeType | null) =>
            set(() => ({ selectedNode: node })),

        selectedEdge: null,
        setSelectedEdge: (edge: FixedEdgeType | null) =>
            set(() => ({ selectedEdge: edge })),
    };
});
