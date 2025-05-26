import { ImageNodeProps } from "@enreco-archive/common/types";
import { getBlurDataURL } from "@/lib/utils";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { Handle, HandleType, Position } from "@xyflow/react";
import { Check } from "lucide-react";
import Image from "next/image";
import { memo, useContext, useMemo } from "react";
import { CurrentChartDataContext } from "@/contexts/CurrentChartData";

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

const ViewImageNode = ({ data, selected }: ImageNodeProps) => {
    const { teams } = useContext(CurrentChartDataContext);

    // Generate handles only on mount since they’re static
    const handles = useMemo(() => {
        const handleData = generateHandles(NUM_OF_HANDLES);

        return handleData.map((handle) => (
            <Handle
                key={handle.key}
                id={handle.id}
                type={handle.type}
                position={handle.position}
                style={{ ...handle.style, opacity: 0 }}
                isConnectable={false}
            />
        ));
    }, []);

    return (
        <>
            {handles}
            <div
                className={cn(
                    "node-content relative cursor-pointer w-[100px] h-[100px] rounded dark:brightness-[0.87]",
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
                    placeholder="blur"
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

                {teams[data.teamId] && (
                    <Image
                        className="absolute top-1 left-1 opacity-80 z-20"
                        width={25}
                        height={25}
                        src={teams[data.teamId].teamIconSrc}
                        alt="team icon"
                        priority={true}
                    />
                )}
                {data.isRead && (
                    <Check
                        size={25}
                        className="absolute top-1 right-1 opacity-80 z-20"
                        color="white"
                    />
                )}
            </div>
        </>
    );
};

export default memo(ViewImageNode);
