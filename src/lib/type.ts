import { Edge, EdgeProps, Node, NodeProps } from "@xyflow/react";
import { CSSProperties } from "react";

/* App Types */
export type StringToBooleanObjectMap = { [key: string]: boolean };
export type FitViewOperation = "fit-to-node" | "fit-to-edge" | "fit-to-all" | "none";
export type TeamMap = { [key: string]: Team };
export type RelationshipMap = { [key: string]: Relationship };

/* Data Types */
export type SiteData = {
    version: number;
    numberOfChapters: number;
    event: string;
    chapters: Chapter[];
};

export type Chapter = {
    numberOfDays: number;
    title: string;
    charts: ChartData[];
    teams: TeamMap;
    relationships: RelationshipMap;
}

export type EditorChapter = {
    numberOfDays: number;
    title: string;
    charts: EditorChartData[];
    teams: TeamMap;
    relationships: RelationshipMap;
}

export type Team = {
    id: string;
    name: string;
    teamIconSrc: string;
}

export type Relationship = {
    id: string;
    name: string;
    style: React.CSSProperties;
}

export type ChartData = {
    title: string;
    dayRecap: string;
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
}

export type EditorChartData = {
    title: string;
    dayRecap: string;
    nodes: ImageNodeType[];
    edges: CustomEdgeType[];
}

/* Chart Types */
type CommonNodeData = {
    title: string;
    content: string;
    imageSrc: string;
    teamId: string;
    status: string;
    new: boolean;
    bgCardColor: string;

    // The following properties are used during the rendering of this node,
    // and should not be filled by the data source.
    renderTeamImageSrc?: string;
}

export type ImageNodeData = CommonNodeData & {

};

type CommonEdgeData = {
    relationshipId: string;
    title: string;
    content: string;
    timestampUrl: string;
    path: string;
    marker: boolean;
    new: boolean;
}

export type CustomEdgeData = CommonEdgeData & {
    
};

export type FixedEdgeData = CommonEdgeData & {
    // The following properties are used during the rendering of this edge,
    // and should not be filled by the data source.
    renderEdgeStyle?: CSSProperties;
    renderIsHoveredEdge?: boolean;
}

export type ImageNodeType = Node<ImageNodeData, "image">;
export type ImageNodeProps = NodeProps<ImageNodeType>;

export type CustomEdgeTypeNames = "custom" | "customSmooth" | "customStraight";
export type CustomEdgeType = Edge<CustomEdgeData, CustomEdgeTypeNames>;
export type CustomEdgeProps = EdgeProps<CustomEdgeType>;

export type FixedEdgeType = Edge<FixedEdgeData, "fixed">;
export type FixedEdgeProps = EdgeProps<FixedEdgeType>;
