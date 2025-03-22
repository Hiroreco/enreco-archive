import { Chapter, ImageNodeType, StringToBooleanObjectMap } from "@/lib/type";
import { idFromChapterDayId } from "@/lib/utils";
import { OLD_NODE_OPACITY } from "./constants";
import { CardType } from "@/store/viewStore";

export function generateRenderableNodes(
    chapterData: Chapter, 
    chapter: number, 
    day: number,
    teamVisibility: StringToBooleanObjectMap,
    characterVisibility: StringToBooleanObjectMap,
    selectedNodes: string[],
    currentCard: CardType
) {
    return chapterData.charts[day].nodes
        // Resolve all nodes.
        // If a node isn't available for the current day, find the most recent node
        // from the past days.
        .map((node) => {
            if (node.data.day !== day) {
                const latestUpdatedNodes = chapterData.charts[node.data.day].nodes;
                const latestUpdatedNode = latestUpdatedNodes.find((n) => node.id === n.id);
                return latestUpdatedNode ? latestUpdatedNode : node;
            }
            return node;
        })
        // Filter out undefined nodes and nodes of incorrect types.
        .filter((node): node is ImageNodeType => node !== undefined)
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
            node.hidden = !(teamVisibility[node.data.teamId || "null"] && characterVisibility[node.id]);

            // Set selected status of node based on selectedNodes list.
            node.selected = selectedNodes.indexOf(node.id) !== -1;

            // Older nodes are translucent.
            node.data.renderOpacity = node.data.day === day ? 1 : OLD_NODE_OPACITY;

            // Dim other nodes if a node is selected.
            const cardOtherThanSettingsOpen = currentCard !== null && currentCard !== "setting";
            node.data.renderDimly = !node.selected && cardOtherThanSettingsOpen;

            // Set team icon image, if available
            if (node.data.teamId) {
                node.data.renderTeamImageSrc =
                    chapterData.teams[node.data.teamId].teamIconSrc ||
                    "";
            } else {
                node.data.renderTeamImageSrc = "";
            }

            return node;
        });
}

export function generateRenderableEdges() {

}