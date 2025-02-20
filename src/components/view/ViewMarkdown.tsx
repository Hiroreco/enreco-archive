import TimestampHref from "@/components/view/content-components/TimestampHref";
import ViewFaunaEasterEgg from "@/components/view/easter-eggs/ViewFaunaEasterEgg";
import ViewPotatoSalidEasterEgg from "@/components/view/easter-eggs/ViewPotatoSalidEasterEgg";
import { FixedEdgeType, ImageNodeType } from "@/lib/type";
import { getBlurDataURL, getLighterOrDarkerColor } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import Image from "next/image";
import {
    Children,
    cloneElement,
    isValidElement,
    MouseEvent,
    MouseEventHandler,
    ReactNode,
} from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export type NodeLinkClickHandler = (targetNode: ImageNodeType) => void;
export type EdgeLinkClickHandler = (targetEdge: FixedEdgeType) => void;

const EASTER_EGGS: { [key: string]: ReactNode } = {
    faunamart: <ViewFaunaEasterEgg />,
    potato: <ViewPotatoSalidEasterEgg />,
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
export function ViewMarkdown({
    onNodeLinkClicked,
    onEdgeLinkClicked,
    children,
}: Props) {
    const { getNode, getEdge } = useReactFlow<ImageNodeType, FixedEdgeType>();

    const nodeLinkHandler: MouseEventHandler<HTMLAnchorElement> = (
        event: MouseEvent<HTMLAnchorElement>,
    ) => {
        event.preventDefault();

        const nodeId =
            (event.target as Element).getAttribute("data-node-id") || "";
        const targetNode: ImageNodeType | undefined = getNode(nodeId);
        if (!targetNode) {
            return;
        }

        onNodeLinkClicked(targetNode);
    };

    const edgeLinkHandler: MouseEventHandler<HTMLAnchorElement> = (
        event: MouseEvent<HTMLAnchorElement>,
    ) => {
        event.preventDefault();

        const edgeId =
            (event.target as Element).getAttribute("data-edge-id") || "";
        const targetEdge: FixedEdgeType | undefined = getEdge(edgeId);
        if (!targetEdge) {
            return;
        }

        onEdgeLinkClicked(targetEdge);
    };

    const processTeamIcons = (node: ReactNode): ReactNode => {
        const teamIcons: { [key: string]: string } = {
            "Amber Coin": "images/original-optimized/ambercoin.webp",
            "Scarlet Wand": "images/original-optimized/scarletwand.webp",
            "Cerulean Cup": "images/original-optimized/ceruleancup.webp",
            "Jade Sword": "images/original-optimized/jadesword.webp",
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
    };

    return (
        <Markdown
            className={"pb-20 relative"}
            rehypePlugins={[rehypeRaw, remarkGfm]}
            components={{
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
                                -30,
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
                                -30,
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
                        if (url.includes("embed")) {
                            // turn embed to live
                            // example https://www.youtube.com/embed/1_dhGL0K5-k?si=OCYF7bUx3zTLXPnC&amp;start=7439)
                            // to https://www.youtube.com/embed/1_dhGL0K5-k?t=7439
                            // This is mostly to handle mistakes I made at the beginning in the markdown
                            const videoid = url
                                .split("/embed/")[1]
                                .split("?si=")[0];
                            const params = url.split("start=")[1];
                            url = `https://www.youtube.com/live/${videoid}?t=${params}`;
                        }

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
                                className="font-semibold"
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
                        console.log(egg);
                        return EASTER_EGGS[egg];
                    } else {
                        return (
                            <TimestampHref
                                href={href || ""}
                                caption={rest.children as string}
                                {...rest}
                                type="general"
                            />
                        );
                    }
                },
            }}
        >
            {children}
        </Markdown>
    );
}
