import { Edge, EdgeProps, Node, NodeProps } from "@xyflow/react";

/* Settings Types */
export type ThemeType = "system" | "light" | "dark";

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
    chapters: {
        [lang: string]: Chapter[];
    };
};

export type LocalizedString<T extends string = "en" | "ja"> = {
    [key in T]: string;
};

export type LocalizedTextEntry = {
    id: string;
    content: LocalizedString;
    title: LocalizedString;
    hasAudio?: boolean;
};

export type LocalizedTextGroup = {
    chapter: number;
    category: string;
    title: LocalizedString;
    description: LocalizedString;
    entries: LocalizedTextEntry[];
};

export type TextData = {
    [key: string]: LocalizedTextGroup;
};

// Legacy types maintained for reference
export type TextEntry = {
    id: string;
    content: string;
    title: string;
    hasAudio?: boolean;
};

export type TextGroup = {
    chapter: number;
    category: string;
    title: string;
    description: string;
    entries: TextEntry[];
};

// Add new type for text audio state
export type TextAudioState = {
    isPlaying: boolean;
    currentTextId: string | null;
};

/* Raw/Localized Types - for raw data import and internal processing */
export type LocalizedChapterRecapData = {
    chapters: {
        title: LocalizedString;
        content: LocalizedString;
    }[];
};

/* App Types - what components actually use (strings only) */
export type ChapterRecapData = {
    chapters: {
        title: string;
        content: string;
    }[];
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

/* Raw/Localized Types - for raw data import */
export type LocalizedChapter = {
    numberOfDays: number;
    title: LocalizedString;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charts: any[];
    teams: TeamMap;
    relationships: RelationshipMap;
    bgiSrc: string;
    bgmSrc: string;
};

/* App Types - what components actually use */
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
    title: string | LocalizedString;
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

/* Raw/Localized Types - for raw data import */
export type LocalizedChartData = {
    title: LocalizedString;
    dayRecap: LocalizedString;
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
};

/* App Types - what components actually use */
export type ChartData = {
    title: string;
    dayRecap: string;
    nodes: ImageNodeType[];
    edges: FixedEdgeType[];
};

export type EditorChartData = {
    title: string | LocalizedString;
    dayRecap: string | LocalizedString;
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
    faction?: string;
    day: number;
    bgCardColor: string;
};

export type EditorImageNodeData = CommonNodeData & {
    // The following properties are used during the rendering of this node,
    // and should not be filled by the data source.
    renderShowHandles?: boolean;
};

export type ImageNodeData = CommonNodeData & {};

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

export type FixedEdgeData = CommonEdgeData & {};

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
export type GlossaryPageData = { [key: string]: CommonItemData[] };

export type GalleryImage = {
    source: string;
    title: string;
};

export type CommonItemData = {
    id: string;
    title: string;
    chapters: number[];
    thumbnailSrc: string;
    content: string;
    galleryImages: GalleryImage[];
    modelSrc?: string;
    imageSrc?: string;
    quote?: string;
};

export type Song = {
    title: string;
    info: string;
    originalUrl: string;
    sourceUrl: string;
    coverUrl: string;
    // The duration is in the format "mm:ss", only for representative purposes
    duration: string;
};

export type SongRaw = {
    title: string;
    info: {
        en: string;
        ja: string;
    };
    originalUrl: string;
    sourceUrl: string;
    coverUrl: string;
    // The duration is in the format "mm:ss", only for representative purposes
    duration: string;
};

export type Egg = {
    [key: string]: {
        sfxList: {
            src: string;
            hasPlayed: boolean;
        }[];
    };
};

export type EasterEggState = {
    isPlaying: boolean;
    currentSoundIndex: number;
    playedSounds: Set<number>;
};

export type MediaType = "video" | "image" | "youtube";
export type NewsCategory = "all" | "merch" | "event" | "media" | "showcase";

export type NewsData = {
    content: string;
    date: string;
    avatarSrc: string;
    author: string;
    media: {
        type: MediaType;
        src: string;
    };
    src: string;
    chapter: number;
    category: NewsCategory;
};
