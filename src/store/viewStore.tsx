import { SiteData } from "@/lib/type";
import { create } from "zustand";

export type CardType = "node" | "edge" | "setting" | null;

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

    modalOpen: boolean;
    setModalOpen: (isModalOpen: boolean) => void;
    siteData: SiteData;
    setSiteData: (data: SiteData) => void;

    hoveredEdgeId: string | null;
    setHoveredEdgeId: (hoveredEdgeId: string) => void;
}

export const useViewStore = create<ViewState>((set) => ({
    chapter: 0,
    setChapter: (chapter: number) => set(() => ({ chapter })),
    day: 0,
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
    setCharacterVisibility: (characterVisibility: { [key: string]: boolean }) =>
        set(() => ({ characterVisibility })),

    modalOpen: false,
    setModalOpen: (modalOpen: boolean) => set(() => ({ modalOpen })),
    siteData: { event: "", chapter: { title: "", charts: [] } },
    setSiteData: (siteData: SiteData) => set(() => ({ siteData })),

    hoveredEdgeId: null,
    setHoveredEdgeId: (hoveredEdgeId: string) => set(() => ({ hoveredEdgeId })),
}));
