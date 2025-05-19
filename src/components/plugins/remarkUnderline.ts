import { visit } from "unist-util-visit";
import { Node } from "unist";
import { Element, Text } from "hast";

export default function remarkUnderline() {
    return (tree: Node) => {
        // eslint-disable-next-line
        visit(tree, "emphasis", (node: any, _idx, parent) => {
            // remark-gfm puts both ** and __ into "emphasis" with `node.marker`
            // Only transform those that used __
            if (node.marker === "__") {
                const newNode: Element = {
                    type: "element",
                    tagName: "u",
                    properties: {},
                    children: node.children as Text[],
                };
                const idx = parent.children.indexOf(node);
                parent.children.splice(idx, 1, newNode);
            }
        });
    };
}
