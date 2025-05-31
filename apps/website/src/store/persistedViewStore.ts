import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type ReadStore = {
    // Chapter Index
    [key: number]: {
        // Day Index
        [key: number]: {
            // Node/Edge Id Index
            [key: string]: boolean 
        }
    }
};

interface PersistedViewStore {
    hasVisitedBefore: boolean;
    setHasVisitedBefore: (newVal: boolean) => void;

    readStatus: ReadStore;
    getReadStatus: (chapter: number, day: number, id: string) => boolean;
    setReadStatus: (chapter: number, day: number, id: string, status: boolean) => void;
    countReadElements: (chapter: number, day: number) => number;
}

export const usePersistedViewStore = create<PersistedViewStore>()(
    persist(immer((set, get) => ({
        hasVisitedBefore: false,
        setHasVisitedBefore: (newVal) => set(draft => { draft.hasVisitedBefore = newVal; }),

        readStatus: [],
        getReadStatus: (chapter, day, id) => {
            const chapterLevel = get().readStatus[chapter];
            
            if(chapterLevel) {
                const dayLevel = chapterLevel[day];
                if(dayLevel) {
                    return dayLevel[id] ?? false;
                }
            }

            return false;
        },
        setReadStatus: (chapter, day, id, status) => 
            set(draft => {
                if(draft.readStatus[chapter] === undefined) {
                    draft.readStatus[chapter] = {};
                }
                
                if(draft.readStatus[chapter][day] === undefined) {
                    draft.readStatus[chapter][day] = {};
                }

                draft.readStatus[chapter][day][id] = status; 
            }),
        countReadElements: (chapter, day) => {
            const chapterLevel = get().readStatus[chapter];

            if(chapterLevel) {
                const dayLevel = chapterLevel[day];

                if(dayLevel) {
                    return Object.keys(dayLevel).length;
                }
            }
            
            return 0;
        }
    })), { name: "viewAppPersistedState" })
)