import EasterEgg from "@/components/view/markdown/EasterEgg";
import EdgeLink, {
    EdgeLinkClickHandler,
} from "@/components/view/markdown/EdgeLink";
import NodeLink, {
    NodeLinkClickHandler,
} from "@/components/view/markdown/NodeLink";
import TimestampHref from "@/components/view/markdown/TimestampHref";
import { getBlurDataURL, urlToLiveUrl } from "@/lib/utils";

import { Element, ElementContent, Text } from "hast";
import Image from "next/image";
import { memo, useMemo } from "react";
import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Node } from "unist";
import { TestFunction } from "unist-util-is";
import { visit } from "unist-util-visit";

import "@/components/view/ViewMarkdown.css";

/*
Custom rehype plugin to convert lone images in paragraphs into figures.
Basically it takes this html:

<p>
  <img src="" alt="" />
</p>

and turns it into

<figure>
    <img src="" />
    <figcaption>
        {alt text}
    </figcaption>
</figure>

We do this here because <figure> cannot be a child of <p>. 
While the browser seemingly doesn't care, nextjs will complain about
hydration errors so we need to take care of it here. We can't do this 
at the markdown/remark level as the parser wants to wrap everything in 
a paragraph when it turns the markdown into html. 
*/
function transformImageParagraphToFigure() {
    /* Match only <p> elements with one <img> child. */
    const elementFilter: TestFunction = (node: Node) => {
        if (node.type === "element") {
            const element = node as Element;
            const elementChild = element.children[0] as Element;

            return (
                element.tagName === "p" &&
                element.children.length === 1 &&
                elementChild.tagName === "img"
            );
        }

        return false;
    };

    return function (tree: Node) {
        visit(tree, elementFilter, (node) => {
            const pElement = node as Element;
            const imgChild = pElement.children[0] as Element;

            const newNode: Element = {
                type: "element",
                tagName: "figure",
                position: undefined,
                properties: {},
                children: [
                    ...pElement.children,
                    {
                        type: "element",
                        tagName: "figcaption",
                        position: undefined,
                        properties: {},
                        children: [
                            {
                                type: "text",
                                value: imgChild.properties["alt"],
                            } as Text,
                        ] as ElementContent[],
                    } as Element,
                ],
            };

            Object.assign(node, newNode);
        });
    };
}

/*
Custom rehype plugin to add team icons to the end of team names.
This is done like so:

for each text node in the hast tree:
    split the text by team names
    if no team names are found:
        return immediately
    else:
        wrap each instance of a team name in a span with a specific class (see ViewMarkdown.css)
        add that as a child of the parent while keeping the correct position

The advantage of this method (although it is way more complex) is that it will
find the team name everywhere in the markdown.
*/
function addTeamIcons() {
    const teamCssClasses = new Map([
        ["Amber Coin", "amber-coin"],
        ["Scarlet Wand", "scarlet-wand"],
        ["Cerulean Cup", "cerulean-cup"],
        ["Jade Sword", "jade-sword"],
        ["Chef", "ch2_jobs_chef"],
        ["Jeweler", "ch2_jobs_jeweler"],
        ["Smith", "ch2_jobs_smith"],
        ["Supplier", "ch2_jobs_supplier"],
    ]);

    /* 
    Match only text blocks that are not children of a span element. 
    This is to prevent an infinite team name substitution loop.
    */
    const elementFilter: TestFunction = (node, _index, parent) => {
        if (node.type === "text" && parent?.type === "element") {
            const parentElement = parent as Element;
            return parentElement.tagName !== "span";
        }

        return false;
    };

    return function (tree: Node) {
        visit(tree, elementFilter, (node, _index, parent) => {
            const textNode = node as Text;
            const parts = textNode.value.split(
                /(Amber Coin|Scarlet Wand|Cerulean Cup|Jade Sword|Chef|Jeweler|Smith|Supplier)/g,
            );

            const newChildren: ElementContent[] = parts.map((part) => {
                if (teamCssClasses.has(part)) {
                    return {
                        type: "element",
                        tagName: "span",
                        properties: {
                            class: teamCssClasses.get(part),
                        },
                        children: [
                            {
                                type: "text",
                                value: part,
                            } as Text,
                        ] as ElementContent[],
                    } as Element;
                } else {
                    return {
                        type: "text",
                        value: part,
                    } as Text;
                }
            });

            if (newChildren.length !== 1) {
                const parentElem = parent as Element;
                const nodeChildIdx = parentElem.children.indexOf(textNode);
                parentElem.children.splice(nodeChildIdx, 1, ...newChildren);
            }
        });
    };
}

/*
Custom rehype plugin to unwrap easter egg <a> elements from <p> elements.
This is basically just to prevent hydration errors again (thanks nextjs).
*/
function unWrapEasterEggLink() {
    /* Match only <p> elements with one <a> child whose href contains "#easter". */
    const elementFilter: TestFunction = (node) => {
        if (node.type === "element") {
            const elementNode = node as Element;

            return (
                elementNode.tagName === "p" &&
                elementNode.children.length === 1 &&
                elementNode.children[0].type == "element" &&
                (elementNode.children[0] as Element).tagName === "a" &&
                (
                    (elementNode.children[0] as Element).properties[
                        "href"
                    ] as string
                ).includes("#easter")
            );
        }

        return false;
    };

    return function (tree: Node) {
        visit(tree, elementFilter, (node) => {
            Object.assign(node, (node as Element).children[0]);
        });
    };
}

/*
Wraps react-markdown while transforming links with a special href value to jump to specific nodes/edges.
All other links are transformed to open in a new tab.

You can generate these special links by using the following markdown: 
For a link to jump to a specific node: [node label](#node:<node id>)
For a link to jump to a specific edge: [edge label](#edge:<edge id>)
For a link to embed a video: [embed label](#embed:<url>)
For a link to show an easter egg: [easter label](#easter:<egg>)
*/

interface ViewMarkdownProps {
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    children: string | null | undefined;
}

function ViewMarkdownInternal({
    onNodeLinkClicked,
    onEdgeLinkClicked,
    children,
}: ViewMarkdownProps) {
    const markdownComponentMap = useMemo(
        (): Components => ({
            img: ({ src = "", alt = "" }) => {
                return (
                    <Image
                        src={src}
                        alt={alt}
                        width={1600}
                        height={900}
                        placeholder="blur"
                        blurDataURL={getBlurDataURL(src)}
                    />
                );
            },
            figcaption: ({ children }) => {
                return (
                    <figcaption className="text-sm opacity-80 italic mt-2">
                        {children}
                    </figcaption>
                );
            },
            a(props) {
                const { href, children } = props;
                // Empty href is an easy to retain the correct cursor.

                if (href && href.startsWith("#node:")) {
                    const nodeId = href.replace("#node:", "");
                    return (
                        <NodeLink
                            nodeId={nodeId}
                            onNodeLinkClick={onNodeLinkClicked}
                        >
                            {children}
                        </NodeLink>
                    );
                } else if (href && href.startsWith("#edge:")) {
                    const edgeId = href.replace("#edge:", "");

                    return (
                        <EdgeLink
                            edgeId={edgeId}
                            onEdgeLinkClick={onEdgeLinkClicked}
                        >
                            {children}
                        </EdgeLink>
                    );
                } else if (href && href.startsWith("#embed")) {
                    let url = href.replace("#embed:", "");
                    url = urlToLiveUrl(url);

                    const caption = children as string;

                    return (
                        <TimestampHref
                            href={url}
                            caption={caption}
                            type="embed"
                        />
                    );
                } else if (href && href.startsWith("#easter")) {
                    const egg = href.replace("#easter:", "");
                    return <EasterEgg easterEggName={egg} />;
                } else if (
                    href &&
                    (href.startsWith("https://www.youtube.com") ||
                        href.startsWith("https://youtu.be"))
                ) {
                    return (
                        <TimestampHref
                            href={urlToLiveUrl(href!) || ""}
                            caption={children as string}
                            type="general"
                        />
                    );
                } else {
                    return (
                        <a
                            href={href}
                            target="_blank"
                            className="font-semibold text-[#6f6ac6]"
                        >
                            {children}
                        </a>
                    );
                }
            },
        }),
        [onEdgeLinkClicked, onNodeLinkClicked],
    );

    const remarkPlugins = useMemo(() => [remarkGfm], []);
    const rehypePlugins = useMemo(
        () => [
            transformImageParagraphToFigure,
            addTeamIcons,
            unWrapEasterEggLink,
        ],
        [],
    );
    return (
        <Markdown
            className={"relative markdown"}
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            components={markdownComponentMap}
        >
            {children}
        </Markdown>
    );
}

export const ViewMarkdown = memo(ViewMarkdownInternal);
