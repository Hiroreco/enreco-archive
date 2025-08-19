import { EditorImageNodeProps } from "@enreco-archive/common/types";
import { useEditorStore } from "@/store/editorStore";
import {
    Handle,
    HandleType,
    Position,
    useUpdateNodeInternals,
} from "@xyflow/react";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useEffect, useState } from "react";
import Image from "next/image";

// Number of handles per side
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
            type: "source" as HandleType,
            position: position,
            style: {
                [positionStyle]: `${space}%`,
            },
            isConnected: false,
        });
    }
    return handles;
};
// Generate node handles, spread on all 4 sides
const generateHandles = (numOfHandles: number) => {
    const handles = [];
    handles.push(...generateHandlesOnSide(Position.Top, "left", numOfHandles));
    handles.push(...generateHandlesOnSide(Position.Right, "top", numOfHandles));
    handles.push(
        ...generateHandlesOnSide(Position.Bottom, "left", numOfHandles),
    );
    handles.push(...generateHandlesOnSide(Position.Left, "top", numOfHandles));

    return handles;
};

const EditorImageNode = ({ data, id }: EditorImageNodeProps) => {
    const {
        showHandles,
        day: currentDay,
        chapter,
        data: chapterData,
    } = useEditorStore();
    const [handles, setHandles] = useState(generateHandles(NUM_OF_HANDLES));
    const updateNodeInternals = useUpdateNodeInternals();
    const handleElements = handles.map((handle) => (
        <Handle
            key={handle.key}
            id={handle.id}
            type={handle.type}
            position={handle.position}
            // Setting opacity to complete 0 cause some weird stuffff to happen
            style={{ ...handle.style, opacity: showHandles ? "1" : "0.001" }}
            isConnectable={showHandles}
        />
    ));
    useEffect(() => {
        // filter for only connected handles
        updateNodeInternals(id);
    }, [id, handles, updateNodeInternals, setHandles]);

    const isCurrentDay = data.day === currentDay || false;

    return (
        <div
            className={cn("relative size-[100px]", {
                "opacity-50": !isCurrentDay,
                "opacity-100": isCurrentDay,
            })}
        >
            {handleElements}
            <Image
                className={cn(
                    "aspect-square object-cover rounded-lg size-full",
                )}
                height={100}
                width={100}
                alt="123"
                src={data.imageSrc}
            />
            {chapter !== null &&
                chapterData[chapter].teams !== null &&
                chapterData[chapter].teams[data.teamId] && (
                    <Image
                        className="absolute top-1 left-1 aspect-square shadow-lg"
                        width={30}
                        height={30}
                        alt=""
                        src={
                            chapterData[chapter].teams[data.teamId].teamIconSrc
                        }
                    />
                )}
        </div>
    );
};

export default EditorImageNode;
