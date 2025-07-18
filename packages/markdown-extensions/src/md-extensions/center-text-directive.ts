import { Root } from "mdast";
import {} from "mdast-util-directive";
import {} from "mdast-util-to-hast";
import { visit } from "unist-util-visit";

const CENTER_TEXT_DIRECTIVE_NAME = "c";

interface Options {
    centerClassname: string;
    blockClassname: string;
};

export default function centerTextDirective(options: Options) {
    const centerClassname = options?.centerClassname ?? "text-center";
    const blockClassname = options?.blockClassname ?? "block";

    return function(tree: Root) {
        visit(tree, function (node) {
            if(node.type === "textDirective" && node.name === CENTER_TEXT_DIRECTIVE_NAME) {
                const data = node.data || (node.data = {});

                data.hName = "span";
                data.hProperties = {
                    "className": [blockClassname, centerClassname]
                };
            }
        });
    }
}