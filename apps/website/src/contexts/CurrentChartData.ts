import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";
import { createContext } from "react";

export type CurrentChartData = {
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
};

export const CurrentChartDataContext = createContext<CurrentChartData>({
    nodes: [],
    edges: [],
});
