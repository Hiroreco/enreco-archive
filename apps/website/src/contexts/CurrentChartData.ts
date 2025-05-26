import { FixedEdgeType, ImageNodeType, RelationshipMap, TeamMap } from "@enreco-archive/common/types";
import { createContext } from "react";

export type CurrentChartData = {
    nodes: ImageNodeType[],
    edges: FixedEdgeType[],
    teams: TeamMap,
    relationships: RelationshipMap
}

export const CurrentChartDataContext = createContext<CurrentChartData>({ 
    nodes: [], 
    edges: [], 
    teams: {}, 
    relationships: {} 
});