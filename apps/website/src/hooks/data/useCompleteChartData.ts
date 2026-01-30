import { useViewStore } from "@/store/viewStore";
import { useLocalizedData } from "../useLocalizedData";
import { resolveDataForDay } from "@/lib/chart-utils";
import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";
import { isEdge, isNode } from "@xyflow/react";
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from "react";

export function useCompleteChartData() {
    const [
        chapter,
        day,
        team,
        character,
        selectedElement,
        relationshipVisibility,
        showOnlyNewEdges
    ] = useViewStore(useShallow((state) => [
        state.chapter,
        state.day,
        state.team,
        state.character,
        state.selectedElement,
        state.relationship,
        state.showOnlyNewEdges
    ]));

    const { getChapter } = useLocalizedData();

    const completeData = useMemo(() => {
        const chapterData = getChapter(chapter);
    
        const { nodes, edges } = resolveDataForDay(chapterData.charts, day);

        for (const node of nodes) {
            node.hidden = !(
                team[node.data.teamId || "null"] && character[node.id]
            );
            if (selectedElement) {
                if (isNode(selectedElement)) {
                    node.selected =
                        node.id === (selectedElement as ImageNodeType).id;
                } else if (isEdge(selectedElement)) {
                    const selectedEdge = selectedElement as FixedEdgeType;
                    node.selected =
                        node.id === selectedEdge.target ||
                        node.id === selectedEdge.source;
                }
            }
        }

        for (const edge of edges) {
            const sourceNode = nodes.find(
                (n) => n.id === edge.source,
            );
            const targetNode = nodes.find(
                (n) => n.id === edge.target,
            );

            const edgesNodesAreVisible =
                sourceNode !== undefined &&
                targetNode !== undefined &&
                (character[sourceNode.id] ?? false) &&
                (character[targetNode.id] ?? false) &&
                (team[sourceNode.data.teamId] ?? false) &&
                (team[targetNode.data.teamId] ?? false);

            edge.hidden = !(
                edgesNodesAreVisible &&
                edge.data !== undefined &&
                relationshipVisibility[edge.data.relationshipId]
            );

            if (selectedElement && isEdge(selectedElement)) {
                const selectedEdge = selectedElement as FixedEdgeType;
                edge.selected = edge.id === selectedEdge.id;
            }

            edge.selectable =
                (showOnlyNewEdges &&
                    edge.data !== undefined &&
                    edge.data.day === day) ||
                !showOnlyNewEdges;
        }

        return { nodes, edges };
    }, [chapter, day, team, character, selectedElement, relationshipVisibility, showOnlyNewEdges]);

    return completeData;
}