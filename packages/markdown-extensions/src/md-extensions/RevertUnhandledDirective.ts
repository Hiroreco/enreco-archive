import { Root, Text } from "mdast";
import { directiveToMarkdown } from "mdast-util-directive";
import { toMarkdown } from "mdast-util-to-markdown";
import { SKIP, visitParents } from "unist-util-visit-parents";

declare module "mdast" {
    interface Data {
        isDirectiveHandled?: boolean | undefined;
    }
}

export default function revertUnhandledDirective() {
    return function (tree: Root) {
        visitParents(tree, function (node, ancestors) {
            if (
                (node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective') && 
                ((node.data && !node.data.isDirectiveHandled) || !(node.data))
            ) {
                const textNode: Text = {
                    type: "text",
                    value: toMarkdown(node, { extensions: [directiveToMarkdown()]}).trimEnd()
                };

                if(ancestors.at(-1)) {
                    const parent = ancestors.at(-1)!;
                    const nodeChildIdx = parent.children.findIndex(n => n === node);

                    if(nodeChildIdx !== -1) {
                        parent.children[nodeChildIdx] = textNode;
                    }
                }

                return SKIP;
            }
        });
    };
}