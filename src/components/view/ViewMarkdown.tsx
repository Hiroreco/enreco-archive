import TimestampHref from "@/components/view/content-components/TimestampHref";
import ViewAmeEasterEgg from "@/components/view/easter-eggs/ViewAmeEasterEgg";
import ViewFaunaEasterEgg from "@/components/view/easter-eggs/ViewFaunaEasterEgg";
import ViewPotatoSalidEasterEgg from "@/components/view/easter-eggs/ViewPotatoSalidEasterEgg";
import { FixedEdgeType, ImageNodeType } from "@/lib/type";
import {
    getBlurDataURL,
    getLighterOrDarkerColor,
    urlToLiveUrl,
} from "@/lib/utils";
import { useSettingStore } from "@/store/settingStore";
import { useReactFlow } from "@xyflow/react";
import Image from "next/image";
import {
    Children,
    cloneElement,
    isValidElement,
    memo,
    MouseEvent,
    MouseEventHandler,
    ReactNode,
    useCallback,
    useMemo,
} from "react";
import Markdown, { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export type NodeLinkClickHandler = (targetNode: ImageNodeType) => void;
export type EdgeLinkClickHandler = (targetEdge: FixedEdgeType) => void;

const EASTER_EGGS: { [key: string]: ReactNode } = {
    faunamart: <ViewFaunaEasterEgg />,
    potato: <ViewPotatoSalidEasterEgg />,
    ame: <ViewAmeEasterEgg />,
};

interface Props {
    onNodeLinkClicked: NodeLinkClickHandler;
    onEdgeLinkClicked: EdgeLinkClickHandler;
    children: string | null | undefined;
}

/*
Wraps react-markdown while transforming links with a special href value to jump to specific nodes/edges.
All other links are transformed to open in a new tab.

You can generate these special links by using the following markdown: 
For a link to jump to a specific node: [node label](#node:<node id>)
For a link to jump to a specific edge: [edge label](#edge:<edge id>)
For a link to open in a new tab: [out label](#out:<url>)
For a link to embed a video: [embed label](#embed:<url>)
For a link to show an image: [image label](#image:<url>)
For a link to show an easter egg: [easter label](#easter:<egg>)
*/
function ViewMarkdownInternal({
    onNodeLinkClicked,
    onEdgeLinkClicked,
    children,
}: Props) {
    const { getNode, getEdge } = useReactFlow<ImageNodeType, FixedEdgeType>();
    // The previous method of tracking the theme based on the document object
    // doesn't update when the theme changes. So using the store directly instead.
    const isDarkMode = useSettingStore((state) => state.themeType === "dark");

    const nodeLinkHandler: MouseEventHandler<HTMLAnchorElement> = useCallback(
        (event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();

            const nodeId =
                (event.target as Element).getAttribute("data-node-id") || "";
            const targetNode: ImageNodeType | undefined = getNode(nodeId);
            if (!targetNode) {
                return;
            }

            onNodeLinkClicked(targetNode);
        },
        [getNode, onNodeLinkClicked],
    );

    const edgeLinkHandler: MouseEventHandler<HTMLAnchorElement> = useCallback(
        (event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();

            const edgeId =
                (event.target as Element).getAttribute("data-edge-id") || "";
            const targetEdge: FixedEdgeType | undefined = getEdge(edgeId);
            if (!targetEdge) {
                return;
            }

            onEdgeLinkClicked(targetEdge);
        },
        [getEdge, onEdgeLinkClicked],
    );

    const processTeamIcons = useCallback((node: ReactNode): ReactNode => {
        const teamIcons: { [key: string]: string } = {
            "Amber Coin": "images-opt/ambercoin.webp",
            "Scarlet Wand": "images-opt/scarletwand.webp",
            "Cerulean Cup": "images-opt/ceruleancup.webp",
            "Jade Sword": "images-opt/jadesword.webp",
        };

        if (typeof node === "string") {
            const parts = node.split(
                /(Amber Coin|Scarlet Wand|Cerulean Cup|Jade Sword)/g,
            );

            return parts.reduce((acc: ReactNode[], part, index) => {
                if (!part) return acc;

                if (teamIcons[part]) {
                    return [
                        ...acc,
                        <span
                            key={index}
                            className="inline-flex items-center gap-1"
                        >
                            {part}
                            <img
                                className="inline h-6 w-6"
                                src={teamIcons[part]}
                                alt={part}
                            />
                        </span>,
                    ];
                }

                return [...acc, part];
            }, []);
        }

        if (isValidElement(node)) {
            const newChildren = Children.map(
                (node as React.ReactElement).props.children,
                processTeamIcons,
            );
            return cloneElement(
                node,
                (node as React.ReactElement).props,
                newChildren,
            );
        }

        return node;
    }, []);

    const markdownComponentMap = useMemo(
        (): Components => ({
            // <br> styles not working for some reason, will use a div instead
            br: () => <div className="block my-6" />,
            p: ({ children }) => {
                const processedChildren = Children.map(
                    children,
                    processTeamIcons,
                );
                return <>{processedChildren}</>;
            },
            li: ({ children }) => {
                const processedChildren = Children.map(
                    children,
                    processTeamIcons,
                );
                return <li>{processedChildren}</li>;
            },
            a(props) {
                const { href, ...rest } = props;

                // Empty href is an easy to retain the correct cursor.
                if (href && href.startsWith("#node:")) {
                    const nodeId = href.replace("#node:", "");

                    // Make the link's color the same as the node's
                    // Not sure about this one, might remove.
                    const node = getNode(nodeId);
                    const style = node?.style;
                    let nodeColor = "#831843";
                    if (style && style.stroke) {
                        nodeColor = getLighterOrDarkerColor(
                            style.stroke,
                            isDarkMode ? 30 : -30,
                        );
                    }
                    return (
                        <a
                            className="font-semibold underline underline-offset-2"
                            style={{ color: nodeColor }}
                            href=""
                            data-node-id={nodeId}
                            onClick={nodeLinkHandler}
                            {...rest}
                        />
                    );
                } else if (href && href.startsWith("#edge:")) {
                    const edgeId = href.replace("#edge:", "");

                    // Make the link's color the same as the edge's
                    // Not sure about this one either, might remove.
                    const edge = getEdge(edgeId);
                    const style = edge?.style;
                    let edgeColor = "#831843";
                    if (style && style.stroke) {
                        edgeColor = getLighterOrDarkerColor(
                            style.stroke,
                            isDarkMode ? 30 : -30,
                        );
                    }
                    return (
                        <a
                            className="font-semibold underline underline-offset-2"
                            style={{ color: edgeColor }}
                            href=""
                            data-edge-id={edgeId}
                            onClick={edgeLinkHandler}
                            {...rest}
                        />
                    );
                } else if (href && href.startsWith("#embed")) {
                    let url = href.replace("#embed:", "");
                    url = urlToLiveUrl(url);

                    const caption = rest.children as string;

                    return (
                        <TimestampHref
                            href={url}
                            caption={caption}
                            {...rest}
                            type={"embed"}
                        />
                    );
                } else if (href && href.startsWith("#out")) {
                    const url = href.replace("#out:", "");
                    return (
                        <a
                            href={url}
                            target="_blank"
                            {...rest}
                            className="font-semibold text-[#6f6ac6]"
                        />
                    );
                } else if (href && href.startsWith("#image")) {
                    const imageUrl = href.replace("#image:", "");
                    const caption = rest.children as string;
                    return (
                        <figure>
                            <Image
                                src={imageUrl}
                                alt={rest.children as string}
                                width={1600}
                                height={900}
                                placeholder="blur"
                                blurDataURL={getBlurDataURL(imageUrl)}
                            />
                            <figcaption className="text-sm opacity-80 italic mt-2">
                                {caption}
                            </figcaption>
                        </figure>
                    );
                } else if (href && href.startsWith("#easter")) {
                    const egg = href.replace("#easter:", "");
                    return EASTER_EGGS[egg];
                } else {
                    return (
                        <TimestampHref
                            href={urlToLiveUrl(href!) || ""}
                            caption={rest.children as string}
                            {...rest}
                            type="general"
                        />
                    );
                }
            },
        }),
        [
            edgeLinkHandler,
            getEdge,
            getNode,
            isDarkMode,
            nodeLinkHandler,
            processTeamIcons,
        ],
    );

    const rehypePlugins = useMemo(() => [rehypeRaw, remarkGfm], []);

    return (
        <Markdown
            className={"relative"}
            rehypePlugins={rehypePlugins}
            components={markdownComponentMap}
        >
            {children}
        </Markdown>
    );
}

export const ViewMarkdown = memo(ViewMarkdownInternal);
