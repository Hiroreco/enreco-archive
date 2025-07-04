import {
    Chapter,
    ChartData,
    FixedEdgeType,
    ImageNodeType,
    StringToBooleanObjectMap,
} from "@enreco-archive/common/types";
import { idFromChapterDayId } from "@/lib/utils";
import {
    OLD_EDGE_OPACITY,
    OLD_NODE_OPACITY,
} from "@enreco-archive/common/constants";
import { CardType } from "@/store/viewStore";

export function generateRenderableNodes(
    chapterData: Chapter,
    dayData: ChartData,
    chapter: number,
    day: number,
    teamVisibility: StringToBooleanObjectMap,
    characterVisibility: StringToBooleanObjectMap,
    selectedNodes: string[],
    currentCard: CardType,
) {
    return (
        dayData.nodes
            // Filter out undefined nodes and nodes of incorrect types.
            .filter(
                (node): node is ImageNodeType =>
                    node !== undefined && node !== null,
            )
            // Clone all nodes (to avoid mutating original nodes)
            .map((node) => structuredClone(node))
            // Set read status for each node
            .map((node) => {
                if (typeof window !== "undefined") {
                    const status = localStorage.getItem(
                        idFromChapterDayId(chapter, day, node.id),
                    );
                    node.data.isRead = status === "read";
                }

                return node;
            })
            // Apply various conditional styling to the node.
            .map((node) => {
                // Hide node if it is not supposed to be visible.
                node.hidden = !(
                    teamVisibility[node.data.teamId || "null"] &&
                    characterVisibility[node.id]
                );

                // Set selected status of node based on selectedNodes list.
                node.selected = selectedNodes.indexOf(node.id) !== -1;

                // Older nodes are translucent.
                node.data.renderOpacity =
                    node.data.day === day ? 1 : OLD_NODE_OPACITY;

                // Dim other nodes if a node is selected.
                const cardOtherThanSettingsOpen =
                    currentCard !== null && currentCard !== "setting";
                node.data.renderDimly =
                    !node.selected && cardOtherThanSettingsOpen;

                // Set team icon image, if available
                if (node.data.teamId) {
                    node.data.renderTeamImageSrc =
                        chapterData.teams[node.data.teamId].teamIconSrc || "";
                } else {
                    node.data.renderTeamImageSrc = "";
                }

                return node;
            })
    );
}

export function generateRenderableEdges(
    chapterData: Chapter,
    dayData: ChartData,
    chapter: number,
    day: number,
    teamVisibility: StringToBooleanObjectMap,
    characterVisibility: StringToBooleanObjectMap,
    edgeVisibility: StringToBooleanObjectMap,
    nodes: ImageNodeType[],
    selectedEdge: FixedEdgeType | null,
    currentCard: CardType,
) {
    return (
        dayData.edges
            // Filter out undefined edges and edges of incorrect types.
            .filter(
                (edge): edge is FixedEdgeType =>
                    edge !== undefined && edge !== null,
            )
            // Clone all nodes (to avoid mutating original nodes)
            .map((edge) => structuredClone(edge))
            // Set read status for each node
            .map((edge) => {
                if (edge.data && typeof window !== "undefined") {
                    const status = localStorage.getItem(
                        idFromChapterDayId(chapter, day, edge.id),
                    );
                    edge.data.isRead = status === "read";
                }

                return edge;
            })
            // Apply various conditional styling to the node.
            .map((edge) => {
                if (!edge.data) {
                    return edge;
                }

                // Hide edge if it is not supposed to be visible.
                const nodeSrc = nodes.find((node) => node.id === edge.source);
                const nodeTarget = nodes.find(
                    (node) => node.id === edge.target,
                );
                if (!nodeSrc || !nodeTarget) {
                    return edge;
                }

                edge.hidden = !(
                    edgeVisibility[edge.data.relationshipId] &&
                    teamVisibility[nodeSrc.data.teamId || "null"] &&
                    teamVisibility[nodeTarget.data.teamId || "null"] &&
                    characterVisibility[nodeSrc.id] &&
                    characterVisibility[nodeTarget.id]
                );

                const edgeStyle =
                    chapterData.relationships[edge.data.relationshipId].style ||
                    {};
                const isCurrentDay = edge.data.day === day;

                if (edgeVisibility["new"]) {
                    edge.style = {
                        ...edgeStyle,
                        opacity: isCurrentDay ? 1 : OLD_EDGE_OPACITY,
                        pointerEvents: isCurrentDay ? "auto" : "none",
                    };
                } else {
                    edge.style = {
                        ...edgeStyle,
                        opacity: 1,
                        pointerEvents: "auto",
                    };
                }

                if (selectedEdge) {
                    edge.selected = selectedEdge.id === edge.id;
                }

                if (edge.data.day !== day) {
                    edge.selectable = false;
                }

                const cardOtherThanSettingsOpen =
                    currentCard !== null && currentCard !== "setting";
                edge.data.renderDimly =
                    !edge.selected && cardOtherThanSettingsOpen;

                return edge;
            })
    );
}
