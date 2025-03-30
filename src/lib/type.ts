import { Edge, EdgeProps, Node, NodeProps } from "@xyflow/react";

/* App Types */
export type StringToBooleanObjectMap = { [key: string]: boolean };
export type FitViewOperation =
    | "fit-to-node"
    | "fit-to-edge"
    | "fit-to-all"
    | "none";
export type TeamMap = { [key: string]: Team };
export type RelationshipMap = { [key: string]: Relationship };

/* Data Types */
export type SiteData = {
    version: number;
    numberOfChapters: number;
    event: string;
    chapters: Chapter[];
};

export type Metadata = {
    version: number;
    numChapters: number;
    exportDatetime: string;
};

export type EditorSaveMetadata = {
    version: number;
    numChapters: number;
    saveDatetime: string;
};

export type Chapter = {
    numberOfDays: number;
    title: string;
    charts: ChartData[];
    teams: TeamMap;
    relationships: RelationshipMap;
    bgiSrc: string;
    bgmSrc: string;
};

export type EditorChapter = {
    numberOfDays: number;
    title: string;
    charts: EditorChartData[];
    teams: TeamMap;
    relationships: RelationshipMap;
    bgiSrc: string;
    bgmSrc: string;
};

export type Team = {
    id: string;
    name: string;
    teamIconSrc: string;
};

export type Relationship = {
    id: string;
    name: string;
    style: React.CSSProperties;
};

export type ChartData = {
    title: string;
    dayRecap: string;
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
};

export type EditorChartData = {
    title: string;
    dayRecap: string;
    nodes: EditorImageNodeType[];
    edges: CustomEdgeType[];
};

/* Chart Types */
type CommonNodeData = {
    title: string;
    content: string;
    imageSrc: string;
    teamId: string;
    status: string;
    day: number;
    bgCardColor: string;
};

export type EditorImageNodeData = CommonNodeData & {
    // The following properties are used during the rendering of this node,
    // and should not be filled by the data source.
    renderShowHandles?: boolean;
};

export type ImageNodeData = CommonNodeData & {
    isRead?: boolean;

    // The following properties are used during the rendering of this node,
    // and should not be filled by the data source.
    renderTeamImageSrc?: string;
    renderOpacity?: number;
    renderDimly?: boolean;
};

export type CustomEdgeOffsets = {
    HL: number;
    VL: number;
    HC: number;
    VR: number;
    HR: number;
};

type CommonEdgeData = {
    relationshipId: string;
    title: string;
    content: string;
    day: number;
    // Optional as this will be set during rendering
    isNewlyAdded?: boolean;
    pathType: "invalid" | "custom" | "smoothstep" | "straight";
    offsets?: CustomEdgeOffsets;
};

export type CustomEdgeData = CommonEdgeData & {};

export type FixedEdgeData = CommonEdgeData & {
    isRead?: boolean;
    // The following properties are used during the rendering of this edge,
    // and should not be filled by the data source.
    renderDimly?: boolean;
};

export type EditorImageNodeType = Node<EditorImageNodeData, "editorImage">;
export type EditorImageNodeProps = NodeProps<EditorImageNodeType>;

export type ImageNodeType = Node<ImageNodeData, "image">;
export type ImageNodeProps = NodeProps<ImageNodeType>;

export type CustomEdgeTypeNames = "custom" | "customSmooth" | "customStraight";
export type CustomEdgeType = Edge<CustomEdgeData, CustomEdgeTypeNames>;
export type CustomEdgeProps = EdgeProps<CustomEdgeType>;

export type FixedEdgeType = Edge<FixedEdgeData, "fixed">;
export type FixedEdgeProps = EdgeProps<FixedEdgeType>;

// Miscellaneous Page Types
export type MiscelPageData = {
    weaponsData: CommonItemData[];
    miscelItemsData: CommonItemData[];
    // if we want more tabs, we can add more types here
};

export type CommonItemData = {
    id: string;
    name: string;
    thumbnailSrc: string;
    content: string;
    modelSrc?: string;
    imageSrc?: string;
    wielder?: string;
    wielderSrc?: string;
};
