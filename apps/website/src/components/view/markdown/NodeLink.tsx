import { ImageNodeType } from "@enreco-archive/common/types";
import { useSettingStore } from "@/store/settingStore";

import { ReactNode, useCallback, useContext } from "react";

import "@/components/view/markdown/ButtonLink.css";
import { CurrentDayDataContext } from "@/contexts/CurrentChartData";
import { getContrastedColor } from "@/lib/color-utils";

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
    const { nodes } = useContext(CurrentDayDataContext);

    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const isDarkMode = useSettingStore((state) => state.themeType === "dark");

    const node = nodes.find((n) => n.id === nodeId);

    const nodeLinkHandler = useCallback(() => {
        if (node && !node.hidden) {
            onNodeLinkClick(node);
        }
    }, [node, onNodeLinkClick]);

    // Make the link's color the same as the node's
    // Not sure about this one, might remove.
    let nodeColor = node?.data.bgCardColor;
    if (nodeColor) {
        nodeColor = getContrastedColor(nodeColor, isDarkMode);
    }

    return (
        <span
            className="font-semibold cursor-pointer underline underline-offset-2"
            style={{ color: nodeColor }}
            onClick={nodeLinkHandler}
        >
            {children}
        </span>
    );
}
