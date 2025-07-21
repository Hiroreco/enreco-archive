import { Root } from "mdast";
import {} from "mdast-util-directive";
import {} from "mdast-util-to-hast";
import { visit } from "unist-util-visit";

const UNDERLINE_DIRECTIVE_NAME = "underline";

interface Options {
    underlineClassname: string;
}

export default function underlineDirective(options: Options) {
    const underlineClassname =
        options?.underlineClassname ?? "underline underline-offset-2";

    return function (tree: Root) {
        visit(tree, function (node) {
            if (
                node.type === "textDirective" &&
                node.name === UNDERLINE_DIRECTIVE_NAME
            ) {
                const data = node.data || (node.data = {});

                data.hName = "span";
                data.hProperties = {
                    className: [underlineClassname],
                };
            }
        });
    };
}
