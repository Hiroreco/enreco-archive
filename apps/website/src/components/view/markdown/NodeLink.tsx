import { ImageNodeType } from "@enreco-archive/common/types";
import { useSettingStore } from "@/store/settingStore";
import { useViewStore } from "@/store/viewStore";

import { ReactNode, useCallback, useContext } from "react";

import "@/components/view/markdown/ButtonLink.css";
import { getContrastedColor } from "@/lib/color-utils";
import useLightDarkModeSwitcher from "@enreco-archive/common/hooks/useLightDarkModeSwitcher";
import { useCompleteChartData } from "@/hooks/data/useCompleteChartData";

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
    const { nodes } = useCompleteChartData();
    const chapter = useViewStore((state) => state.chapter);

    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const theme = useSettingStore((state) => state.themeType);
    const isDarkMode = useLightDarkModeSwitcher(theme);

    // Prepend chapter prefix to match namespaced node IDs
    const namespacedNodeId = `ch${chapter}-${nodeId}`;
    const node = nodes.find((n) => n.id === namespacedNodeId);

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
