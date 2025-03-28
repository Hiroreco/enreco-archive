import { FixedEdgeType, ImageNodeType } from "@/lib/type";
import { getLighterOrDarkerColor } from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";

import { useReactFlow } from "@xyflow/react";
import { ReactNode, useCallback } from "react";

import "@/components/view/markdown/ButtonLink.css";

export type NodeLinkClickHandler = (targetNode: ImageNodeType) => void;

interface NodeLinkProps {
    nodeId: string;
    children?: ReactNode;
    onNodeLinkClick: NodeLinkClickHandler;
};

export default function NodeLink({nodeId, children, onNodeLinkClick}: NodeLinkProps) {
    const { getNode } = useReactFlow<ImageNodeType, FixedEdgeType>();
    
    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const isDarkMode = useSettingStore((state) => state.themeType === "dark");

    const node = getNode(nodeId);

    const nodeLinkHandler = useCallback(() => {
        if(node && !node.hidden) {
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
            className="like-anchor font-semibold underline underline-offset-2"
            style={{ color: nodeColor }}
            onClick={nodeLinkHandler}
        >
            {children}
        </button>
    );
}