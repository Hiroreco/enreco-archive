import { useViewStore } from "@/store/viewStore";
import { useLocalizedData } from "@/hooks/useLocalizedData";

export function useCurrentFactions() {
    const chapter = useViewStore(state => state.chapter);
    const { getChapter } = useLocalizedData();

    return getChapter(chapter).factions;
}