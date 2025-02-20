import { memo, useMemo } from "react";
import { Handle, HandleType, Position } from "@xyflow/react";
import { ImageNodeProps } from "../../lib/type";
import Image from "next/image";
import { OLD_NODE_OPACITY } from "@/lib/constants";
import { useViewStore } from "@/store/viewStore";
import { getBlurDataURL, idFromDayChapterId } from "@/lib/utils";
import { Check } from "lucide-react";

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

const generateHandles = (numOfHandles: number) => [
    ...generateHandlesOnSide(Position.Top, "left", numOfHandles),
    ...generateHandlesOnSide(Position.Right, "top", numOfHandles),
    ...generateHandlesOnSide(Position.Bottom, "left", numOfHandles),
    ...generateHandlesOnSide(Position.Left, "top", numOfHandles),
];

const ViewImageNode = ({ id, data }: ImageNodeProps) => {
    // Generate handles only on mount since they’re static
    const handles = useMemo(() => generateHandles(NUM_OF_HANDLES), []);
    const { day, chapter } = useViewStore();

    const isCurrentDay = data.day === day || false;
    const isRead =
        localStorage.getItem(idFromDayChapterId(day, chapter, id)) === "read";

    return (
        <>
            {handles.map((handle) => (
                <Handle
                    key={handle.key}
                    id={handle.id}
                    type={handle.type}
                    position={handle.position}
                    style={{ ...handle.style, opacity: 0 }}
                    isConnectable={false}
                />
            ))}
            <div
                style={{ opacity: isCurrentDay ? 1 : OLD_NODE_OPACITY }}
                className="transition-all relative cursor-pointer overflow-hidden w-[100px] h-[100px] rounded duration-1000"
            >
                <Image
                    className="aspect-square object-cover rounded-lg transition-transform duration-300 ease-in-out transform scale-100 hover:scale-110 dark:brightness-[0.87]"
                    src={data.imageSrc || ""}
                    width={100}
                    height={100}
                    alt="character node"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL(data.imageSrc)}
                    priority={true}
                />
                {data.renderTeamImageSrc !== "" && (
                    <Image
                        className="absolute top-1 left-1 opacity-80"
                        width={25}
                        height={25}
                        src={data.renderTeamImageSrc || ""}
                        alt="team icon"
                        priority={true}
                    />
                )}
                {isRead && (
                    <Check
                        size={25}
                        className="absolute top-1 right-1 opacity-80"
                        color="white"
                    />
                )}
            </div>
        </>
    );
};

export default memo(ViewImageNode);
