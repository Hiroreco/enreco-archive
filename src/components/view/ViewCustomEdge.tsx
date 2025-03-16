import { generatePath } from "@/lib/get-edge-svg-path";
import { FixedEdgeProps } from "@/lib/type";
import { cn } from "@/lib/utils";
import { memo, useEffect, useId, useMemo, useRef } from "react";

const ViewCustomEdge = ({
    data,
    style,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
}: FixedEdgeProps) => {
    const isNewlyAdded = data?.isNewlyAdded || false;
    const pathRef = useRef<SVGPathElement>(null);
    const maskId = useId();
    const { strokeDasharray, ...restStyle } = style || {};
    const cardOtherThanSettingsOpen =
        data?.currentCard !== null && data?.currentCard !== "setting";

    const path = useMemo(
        () =>
            generatePath(
                data?.pathType,
                data?.offsets,
                sourceX,
                sourceY,
                sourcePosition,
                targetX,
                targetY,
                targetPosition,
            ),
        [
            data?.offsets,
            data?.pathType,
            sourcePosition,
            sourceX,
            sourceY,
            targetPosition,
            targetX,
            targetY,
        ],
    );

    useEffect(() => {
        if (isNewlyAdded && pathRef.current) {
            const length = pathRef.current.getTotalLength();
            pathRef.current.style.strokeDasharray = `${length}`;
            pathRef.current.style.strokeDashoffset = `${length}`;
            pathRef.current.style.animation =
                "drawLine 1s ease-in-out forwards";
        } else if (pathRef.current) {
            pathRef.current.style.strokeDasharray = "none";
            pathRef.current.style.strokeDashoffset = "none";
            pathRef.current.style.animation = "none";
        }
    }, [isNewlyAdded]);

    return (
        <svg
            className={cn(
                "transition-all fill-none duration-1000 dark:brightness-[0.87]",
                {
                    "brightness-90 dark:brightness-50":
                        cardOtherThanSettingsOpen && !data!.isSelected,
                    "brightness-100":
                        cardOtherThanSettingsOpen && data!.isSelected,
                },
            )}
        >
            {/* Mask for dashed edges */}
            <defs>
                {strokeDasharray && (
                    <mask id={maskId}>
                        <path
                            d={path}
                            stroke="white"
                            strokeWidth={data!.isSelected ? 7 : 5}
                            strokeDasharray={strokeDasharray}
                            fill="none"
                            strokeLinecap="round"
                        />
                    </mask>
                )}
            </defs>

            {/* Transparent click area */}
            <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                strokeLinecap="round"
                className="cursor-pointer"
            />

            {/* Actual edge with mask applied if dashed */}
            <path
                ref={pathRef}
                d={path}
                style={{
                    transition: "opacity 1s, stroke-width .3s, stroke 1s",
                    ...restStyle,
                }}
                className={cn("hover:stroke-[7]", {
                    "stroke-[5]": !data!.isSelected,
                    "stroke-[7]": data!.isSelected,
                })}
                mask={strokeDasharray ? `url(#${maskId})` : undefined}
            />

            {/* Animated light effect when selected */}
            {data!.isSelected && (
                <path
                    d={path}
                    stroke="white"
                    strokeWidth={9}
                    strokeLinecap="round"
                    fill="none"
                    className="running-light"
                    style={{
                        filter: "drop-shadow(0 0 3px rgba(255,255,255,0.7))",
                    }}
                />
            )}
        </svg>
    );
};

export default memo(ViewCustomEdge);
