import {
    RelationshipMap,
    TeamMap,
} from "@enreco-archive/common/types";
import { createContext } from "react";

export type CurrentChapterData = {
    teams: TeamMap;
    relationships: RelationshipMap;
};

export const CurrentChapterDataContext = createContext<CurrentChapterData>({
    teams: {},
    relationships: {},
});
