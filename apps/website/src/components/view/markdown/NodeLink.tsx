import { ImageNodeType } from "@enreco-archive/common/types";
import { getLighterOrDarkerColor } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";

import { ReactNode, useCallback, useContext } from "react";

import "@/components/view/markdown/ButtonLink.css";
import { CurrentChartDataContext } from "@/contexts/CurrentChartData";

export type NodeLinkClickHandler = (targetNode: ImageNodeType) => void;

interface NodeLinkProps {
    nodeId: string;
    children?: ReactNode;
    onNodeLinkClick: NodeLinkClickHandler;
}

export default function NodeLink({
    nodeId,
    children,
    onNodeLinkClick,
}: NodeLinkProps) {
    const { nodes } = useContext(CurrentChartDataContext);

    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const isDarkMode = useSettingStore((state) => state.themeType === "dark");

    const node = nodes.find(n => n.id === nodeId);

    const nodeLinkHandler = useCallback(() => {
        if (node && !node.hidden) {
            onNodeLinkClick(node);
        }
    }, [node, onNodeLinkClick]);

    // Make the link's color the same as the node's
    // Not sure about this one, might remove.
    const style = node?.style;
    let nodeColor = "#831843";
    if (style && style.stroke) {
        nodeColor = getLighterOrDarkerColor(
            style.stroke,
            isDarkMode ? 30 : -30,
        );
    }

    return (
        <button
            className="like-anchor underline underline-offset-2"
            style={{ color: nodeColor }}
            onClick={nodeLinkHandler}
        >
            <span className="font-semibold">{children}</span>
        </button>
    );
}
