import { Root } from "mdast";
import {} from "mdast-util-directive";
import {} from "mdast-util-to-hast";
import { visit } from "unist-util-visit";

const CENTER_TEXT_DIRECTIVE_NAME = "center";
const LEFT_TEXT_DIRECTIVE_NAME = "left";
const RIGHT_TEXT_DIRECTIVE_NAME = "right";

interface Options {
    centerClassname: string;
    leftClassname: string;
    rightClassname: string;
};

export default function centerTextDirective(options: Options) {
    const centerClassname = options?.centerClassname ?? "text-center";
    const leftClassname = options?.centerClassname ?? "text-left";
    const rightClassname = options?.centerClassname ?? "text-right";

    return function(tree: Root) {
        visit(tree, function (node) {
            if(node.type === "textDirective") {
                if(node.name === CENTER_TEXT_DIRECTIVE_NAME) {
                    const data = node.data || (node.data = {});
                    data.hName = "span";
                    data.hProperties = {
                        "className": [centerClassname]
                    };
                }
                else if(node.name === LEFT_TEXT_DIRECTIVE_NAME) {
                    const data = node.data || (node.data = {});
                    data.hName = "span";
                    data.hProperties = {
                        "className": [leftClassname]
                    };
                }
                else if(node.name === RIGHT_TEXT_DIRECTIVE_NAME) {
                    const data = node.data || (node.data = {});
                    data.hName = "span";
                    data.hProperties = {
                        "className": [rightClassname]
                    };
                }
            }
        });
    }
}