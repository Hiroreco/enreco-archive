import { Root } from "mdast";
import { visit } from "unist-util-visit";

import type {} from "mdast-util-directive";
import type {} from "mdast-util-to-hast";

import type {} from "@/md-extensions/RevertUnhandledDirective.js"

const UNDERLINE_DIRECTIVE_NAME = "underline";

interface Options {
    underlineClassname: string;
}

export default function underlineDirective(options: Options) {
    const underlineClassname =
        options?.underlineClassname ?? "underline";

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
                data.isDirectiveHandled = true;
            }
        });
    };
}
