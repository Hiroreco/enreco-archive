import { FixedEdgeType } from "@enreco-archive/common/types";
import {
    CurrentChapterDataContext,
    CurrentDayDataContext,
} from "@/contexts/CurrentChartData";
import { getLighterOrDarkerColor } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";

import { ReactNode, useCallback, useContext } from "react";

import "@/components/view/markdown/ButtonLink.css";

export type EdgeLinkClickHandler = (targetEdge: FixedEdgeType) => void;

interface EdgeLinkProps {
    edgeId: string;
    children?: ReactNode;
    onEdgeLinkClick: EdgeLinkClickHandler;
}

export default function EdgeLink({
    edgeId,
    children,
    onEdgeLinkClick,
}: EdgeLinkProps) {
    const { edges } = useContext(CurrentDayDataContext);

    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const isDarkMode = useSettingStore((state) => state.themeType === "dark");

    // This guy is empty, cause the context can't reach it
    const { relationships } = useContext(CurrentChapterDataContext);
    console.log(relationships);

    const edge = edges.find((e) => e.id === edgeId);
    let edgeColor = "#831843";
    // if (edge && edge.data) {
    //     edgeColor = relationships[edge.data.relationshipId]?.style
    //         .stroke as string;
    //     console.log(
    //         "EdgeLink",
    //         edgeColor,
    //         edge.data.relationshipId,
    //         relationships[edge.data.relationshipId],
    //     );
    // }

    const edgeLinkHandler = useCallback(() => {
        if (edge && !edge.hidden) {
            onEdgeLinkClick(edge);
        }
    }, [edge, onEdgeLinkClick]);

    edgeColor = getLighterOrDarkerColor(edgeColor, isDarkMode ? 10 : -10);
    let label = children as string;
    try {
        label = label.split(":")[0];
        label = `${label}: ${edge?.data?.title}`;
    } catch {
        label = `see "${edge?.data?.title}"`;
    }

    return (
        <span
            className="font-semibold cursor-pointer underline underline-offset-2"
            style={{ color: edgeColor }}
            onClick={edgeLinkHandler}
        >
            {label}
        </span>
    );
}
