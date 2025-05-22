import {
    CustomEdgeType,
    CustomEdgeTypeNames,
    EditorChapter,
    EditorChartData,
    EditorImageNodeType,
    RelationshipMap,
    TeamMap,
} from "@enreco-archive/common/types";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";

export type EditorMode = "edit" | "view" | "place" | "delete";
export type CardType =
    | "node"
    | "edge"
    | "general"
    | "relationships"
    | "teams"
    | null;

function createBlankChapter(): EditorChapter {
    return {
        numberOfDays: 0,
        title: "",
        charts: [],
        relationships: {},
        teams: {},
        bgiSrc: "",
        bgmSrc: "",
    };
}

function createBlankDay(): EditorChartData {
    return {
        nodes: [],
        edges: [],
        dayRecap: "",
        title: "",
    };
}

type EditorState = EditorSlice & EditorDataSlice;

interface EditorSlice {
    mode: EditorMode;
    setMode: (mode: EditorMode) => void;

    showHandles: boolean;
    setShowHandles: (showHandles: boolean) => void;

    currentCard: CardType;
    setCurrentCard: (name: CardType) => void;

    edgePaths: { [key: string]: string };
    setEdgePaths: (edgePaths: { [key: string]: string }) => void;

    edgeType: CustomEdgeTypeNames;
    setEdgeType: (edgeType: CustomEdgeTypeNames) => void;

    selectedNode: EditorImageNodeType | null;
    setSelectedNode: (node: EditorImageNodeType | null) => void;

    selectedEdge: CustomEdgeType | null;
    setSelectedEdge: (edge: CustomEdgeType | null) => void;
}

interface EditorDataSlice {
    data: EditorChapter[];
    setData: (newData: EditorChapter[]) => void;

    addChapter: () => void;
    insertChapter: (chapter: number) => void;
    deleteChapter: (chapter: number) => void;

    addDay: () => void;
    insertDay: (day: number) => void;
    deleteDay: (day: number) => void;
    cloneDay: (day: number) => void;
    moveDay: (dayToMove: number, newPos: number) => void;

    chapter: number | null;
    setChapter: (newChapter: number | null) => void;

    day: number | null;
    setDay: (newDay: number | null) => void;

    setNodes: (newNodes: EditorImageNodeType[]) => void;
    setEdges: (newEdges: CustomEdgeType[]) => void;

    setChapterTitle: (title: string) => void;
    setChapterTeams: (teams: TeamMap) => void;
    setChapterRelationships: (relationships: RelationshipMap) => void;

    setDayTitle: (title: string) => void;
    setDayRecap: (recap: string) => void;

    setChapterBackgroundImage: (src: string) => void;
    setChapterBgm: (src: string) => void;
}

const createEditorSlice: StateCreator<
    EditorState,
    [["zustand/immer", never]],
    [["zustand/immer", never]],
    EditorSlice
> = (set) => ({
    mode: "view", // default mode
    setMode: (mode: EditorMode) => set({ mode: mode }),

    showHandles: true, // default value for showHandles
    setShowHandles: (showHandles: boolean) => set({ showHandles: showHandles }),

    currentCard: null,
    setCurrentCard: (currentCard: CardType) =>
        set({ currentCard: currentCard }),

    edgePaths: {},
    setEdgePaths: (edgePaths: { [key: string]: string }) =>
        set({ edgePaths: edgePaths }),

    edgeType: "custom",
    setEdgeType: (edgeType: CustomEdgeTypeNames) => set({ edgeType: edgeType }),

    selectedNode: null,
    setSelectedNode: (node: EditorImageNodeType | null) =>
        set({ selectedNode: node }),

    selectedEdge: null,
    setSelectedEdge: (edge: CustomEdgeType | null) =>
        set({ selectedEdge: edge }),
});

function validateChapter(chapter: number, state: EditorState) {
    stateChapterNotNull(state);
    if (chapter < 0) {
        throw new Error(
            `failed to validate chapter, chapter value is ${chapter} and state.chapter is ${state.chapter}`,
        );
    }
}

function validateDay(day: number, state: EditorState) {
    stateChapterNotNull(state);
    stateDayNotNull(state);
    if (day < 0 || day > state.data[state.chapter!].numberOfDays) {
        throw new Error(
            `failed to validate day, day value is ${day}, state.chapter is ${state.chapter}, number of days is ${state.chapter !== null ? state.data[state.chapter!].numberOfDays : 0}`,
        );
    }
}

function stateChapterNotNull(state: EditorState) {
    if (state.chapter === null) {
        throw new Error("state.chapter is null");
    }
}

function stateDayNotNull(state: EditorState) {
    if (state.chapter === null) {
        throw new Error("state.day is null");
    }
}

const createEditorDataSlice: StateCreator<
    EditorState,
    [["zustand/immer", never]],
    [["zustand/immer", never]],
    EditorDataSlice
> = (set, get) => ({
    data: [],

    setData: (newData: EditorChapter[]) => {
        set((state) => {
            state.data = newData;
            state.chapter = newData.length ? 0 : null;
            state.day = newData.length ? 0 : null;
        });
    },

    addChapter: () =>
        set((state) => {
            state.data.push(createBlankChapter());
        }),
    insertChapter: (chapter: number) => {
        validateChapter(chapter, get());

        set((state) => {
            state.data.splice(chapter + 1, 0, createBlankChapter());
        });
    },
    deleteChapter: (chapter: number) => {
        validateChapter(chapter, get());

        set((state) => {
            state.data.splice(chapter, 1);
        });
    },

    addDay: () => {
        stateChapterNotNull(get());

        set((state) => {
            state.data[get().chapter!].charts.push(createBlankDay());
            state.data[get().chapter!].numberOfDays++;
        });
    },
    insertDay: (day: number) => {
        validateDay(day, get());

        const ch = get().chapter!;

        set((state) => {
            state.data[ch].charts.splice(day + 1, 0, createBlankDay());
            state.data[ch].numberOfDays++;
        });
    },
    deleteDay: (day: number) => {
        validateDay(day, get());

        const ch = get().chapter!;

        set((state) => {
            state.data[ch].charts.splice(day, 1);
            state.data[ch].numberOfDays--;
        });
    },
    cloneDay: (day: number) => {
        validateDay(day, get());

        const ch = get().chapter!;

        set((state) => {
            const dayClone = structuredClone(get().data[ch].charts[day]);
            state.data[ch].charts.splice(day + 1, 0, dayClone);
            state.data[ch].numberOfDays++;
        });
    },
    moveDay: (dayToMove: number, newPos: number) => {
        validateDay(dayToMove, get());
        validateDay(newPos, get());

        const ch = get().chapter!;

        set((state) => {
            const elem = get().data[ch].charts[dayToMove];
            state.data[ch].charts.splice(dayToMove, 1);
            state.data[ch].charts.splice(newPos, 1, elem);
        });
    },

    chapter: null,
    setChapter: (newChapter: number | null) => {
        set({ chapter: newChapter });
    },

    day: null,
    setDay: (newDay: number | null) => {
        set({ day: newDay });
    },

    setNodes: (newNodes: EditorImageNodeType[]) => {
        stateChapterNotNull(get());
        stateDayNotNull(get());

        set((state) => {
            state.data[get().chapter!].charts[get().day!].nodes = newNodes;
        });
    },

    setEdges: (newEdges) => {
        stateChapterNotNull(get());
        stateDayNotNull(get());

        set((state) => {
            state.data[get().chapter!].charts[get().day!].edges = newEdges;
        });
    },

    setChapterTitle: (title) => {
        stateChapterNotNull(get());

        set((state) => {
            state.data[get().chapter!].title = title;
        });
    },
    setChapterTeams: (teams) => {
        stateChapterNotNull(get());

        set((state) => {
            state.data[get().chapter!].teams = teams;
        });
    },
    setChapterRelationships: (relationships) => {
        stateChapterNotNull(get());

        set((state) => {
            state.data[get().chapter!].relationships = relationships;
        });
    },

    setDayTitle: (title) => {
        stateChapterNotNull(get());
        stateDayNotNull(get());

        set((state) => {
            state.data[get().chapter!].charts[get().day!].title = title;
        });
    },

    setDayRecap: (recap) => {
        stateChapterNotNull(get());
        stateDayNotNull(get());

        set((state) => {
            state.data[get().chapter!].charts[get().day!].dayRecap = recap;
        });
    },

    setChapterBackgroundImage: (src) => {
        stateChapterNotNull(get());

        set((state) => {
            state.data[get().chapter!].bgiSrc = src;
        });
    },

    setChapterBgm: (src) => {
        stateChapterNotNull(get());

        set((state) => {
            state.data[get().chapter!].bgmSrc = src;
        });
    },
});

export const useEditorStore = create<EditorState>()(
    immer((...a) => ({
        ...createEditorSlice(...a),
        ...createEditorDataSlice(...a),
    })),
);
