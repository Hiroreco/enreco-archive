import { FixedEdgeType } from "@enreco-archive/common/types";
import { useSettingStore } from "@/store/settingStore";

import { ReactNode, useCallback, useContext } from "react";

import "@/components/view/markdown/ButtonLink.css";
import { getContrastedColor } from "@/lib/color-utils";
import useLightDarkModeSwitcher from "@enreco-archive/common/hooks/useLightDarkModeSwitcher";
import { useCompleteChartData } from "@/hooks/data/useCompleteChartData";
import { useCurrentRelationships } from "@/hooks/data/useCurrentRelationships";

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
    const { edges } = useCompleteChartData();
    const relationships = useCurrentRelationships();

    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const theme = useSettingStore((state) => state.themeType);
    const isDarkMode = useLightDarkModeSwitcher(theme);

    let edge = edges.find((e) => e.id === edgeId);
    if (!edge) {
        // id is sourceA-sourceB, so swap it if not found
        edgeId = edgeId.split("-").reverse().join("-");
        edge = edges.find((e) => e.id === edgeId);
    }

    const edgeLinkHandler = useCallback(() => {
        if (edge && !edge.hidden) {
            onEdgeLinkClick(edge);
        }
    }, [edge, onEdgeLinkClick]);

    let edgeColor = "#831843";
    if (
        edge?.data?.relationshipId &&
        relationships[edge?.data?.relationshipId]
    ) {
        edgeColor = getContrastedColor(
            relationships[edge?.data?.relationshipId].style.stroke ?? edgeColor,
            isDarkMode,
        );
    }

    let label = children as string;
    try {
        label = label.split(":")[0];
        if (!label) {
            label = label.split("：")[0];
        }
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
