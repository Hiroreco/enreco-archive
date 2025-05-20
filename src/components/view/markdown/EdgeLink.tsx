import { FixedEdgeType, ImageNodeType } from "@/lib/type";
import { getLighterOrDarkerColor } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";

import { useReactFlow } from "@xyflow/react";
import { ReactNode, useCallback, useEffect, useState } from "react";

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
    const { getEdge } = useReactFlow<ImageNodeType, FixedEdgeType>();

    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const isDarkMode = useSettingStore((state) => state.themeType === "dark");

    const [edge, setEdge] = useState<FixedEdgeType | null>(null);
    useEffect(() => {
        const edge = getEdge(edgeId);
        if (edge) {
            setEdge(edge);
        } else {
            setEdge(null);
        }
    }, [edgeId, getEdge]);

    const edgeLinkHandler = useCallback(() => {
        if (edge && !edge.hidden) {
            onEdgeLinkClick(edge);
        }
    }, [edge, onEdgeLinkClick]);

    // Make the link's color the same as the node's
    // Not sure about this one, might remove.
    const style = edge?.style;
    let edgeColor = "#831843";
    if (style && style.stroke) {
        edgeColor = getLighterOrDarkerColor(
            style.stroke,
            isDarkMode ? 10 : -10,
        );
    }

    let label = children as string;
    try {
        label = label.split(":")[0];
        label = `${label}: ${edge?.data?.title}`;
    } catch {
        label = `see "${edge?.data?.title}"`;
    }

    return (
        <button
            className="like-anchor underline underline-offset-2"
            style={{ color: edgeColor }}
            onClick={edgeLinkHandler}
        >
            <span className="font-semibold">{label}</span>
        </button>
    );
}
