import { ImageNodeProps } from "@enreco-archive/common/types";
import { getBlurDataURL } from "@/lib/utils";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Handle, HandleType, Position } from "@xyflow/react";
import { Check } from "lucide-react";
import Image from "next/image";
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { CurrentChapterDataContext } from "@/contexts/CurrentChartData";

import "./ViewImageNode.css";
import {
    getReadStatus,
    usePersistedViewStore,
} from "@/store/persistedViewStore";
import { useViewStore } from "@/store/viewStore";

const NUM_OF_HANDLES = 5;

const generateHandlesOnSide = (
    position: Position,
    positionStyle: "left" | "top",
    numOfHandles: number,
) => {
    const handles = [];
    const step = 100 / numOfHandles;
    const halfStep = step / 2;
    let space = 0;
    for (let i = 0; i < numOfHandles; i++) {
        space += i === 0 ? halfStep : step;
        handles.push({
            key: `${position}-${i}`,
            id: `${position}-${i}`,
            type: "source-target" as HandleType, // Make all handles support both source and target
            position: position,
            style: {
                [positionStyle]: `${space}%`,
            },
            isConnected: false,
        });
    }
    return handles;
};

const generateHandles = (numOfHandles: number) => [
    ...generateHandlesOnSide(Position.Top, "left", numOfHandles),
    ...generateHandlesOnSide(Position.Right, "top", numOfHandles),
    ...generateHandlesOnSide(Position.Bottom, "left", numOfHandles),
    ...generateHandlesOnSide(Position.Left, "top", numOfHandles),
];

const ViewImageNode = ({ data, selected, id }: ImageNodeProps) => {
    const { teams, nodeHandles } = useContext(CurrentChapterDataContext);

    const chapter = useViewStore((state) => state.data.chapter);
    const day = useViewStore((state) => state.data.day);
    const readStatus = usePersistedViewStore((state) => state.readStatus);

    // Track whether initial render is complete
    const [initialRenderComplete, setInitialRenderComplete] = useState(false);

    const isNodeRead = getReadStatus(readStatus, chapter, day, id);

    // Generate all possible handles for initial render
    const allHandles = useMemo(() => {
        const handleData = generateHandles(NUM_OF_HANDLES);

        return handleData.map((handle) => (
            <Handle
                key={`${handle.key}-all`}
                id={handle.id}
                type={handle.type}
                position={handle.position}
                style={{ ...handle.style, opacity: 0 }}
                isConnectable={false}
            />
        ));
    }, []);

    // Get optimized handles from nodeHandles data after initial render
    const optimizedHandles = useMemo(() => {
        if (!nodeHandles || !nodeHandles[id]) return [];

        return nodeHandles[id].map((handle) => (
            <Handle
                key={`${handle.id}-${chapter}`}
                id={handle.id}
                type={handle.type as HandleType}
                position={handle.position as Position}
                style={{ ...handle.style, opacity: 0 }}
                isConnectable={false}
            />
        ));
    }, [nodeHandles, id, chapter]);

    // Switch from all handles to optimized handles after initial render
    useEffect(() => {
        // Use a small timeout to ensure edges are connected first
        const timer = setTimeout(() => {
            setInitialRenderComplete(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // When chapter changes, temporarily revert to all handles
    useEffect(() => {
        if (initialRenderComplete) {
            setInitialRenderComplete(false);
            const timer = setTimeout(() => {
                setInitialRenderComplete(true);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [chapter, initialRenderComplete]);

    return (
        <>
            {initialRenderComplete ? optimizedHandles : allHandles}
            <div
                className={cn(
                    "node-content relative cursor-pointer w-[100px] h-[100px] rounded",
                    {
                        "hover:scale-110 transition-transform": !selected,
                    },
                )}
            >
                <Image
                    className={cn(
                        "aspect-square object-cover rounded-lg absolute z-10",
                    )}
                    src={data.imageSrc || ""}
                    width={100}
                    height={100}
                    alt="character node"
                    placeholder={
                        getBlurDataURL(data.imageSrc) ? "blur" : "empty"
                    }
                    blurDataURL={getBlurDataURL(data.imageSrc)}
                    priority={true}
                />

                {/* Border animation to indicate selected node */}
                {selected && (
                    <div
                        className="absolute w-[110px] h-[110px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 running-border"
                        style={
                            {
                                "--border-color": data.bgCardColor,
                            } as React.CSSProperties
                        }
                    />
                )}

                {teams[data.teamId] && id !== "lore" && (
                    <Image
                        className="absolute top-1 left-1 opacity-80 z-20"
                        width={25}
                        height={25}
                        src={teams[data.teamId].teamIconSrc}
                        alt="team icon"
                        priority={true}
                    />
                )}
                {isNodeRead && (
                    <div className="absolute top-1 right-1 z-20 bg-black/50 rounded-full p-1">
                        <Check size={17} className="opacity-90" color="white" />
                    </div>
                )}
            </div>
        </>
    );
};

export default memo(ViewImageNode);
