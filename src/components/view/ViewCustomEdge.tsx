import { generatePath } from "@/lib/get-edge-svg-path";
import { FixedEdgeProps } from "@/lib/type";
import { cn } from "@/lib/utils";
import { useViewStore } from "@/store/viewStore";
import { memo, useEffect, useMemo, useRef } from "react";

const ViewCustomEdge = ({
    data,
    style,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    id,
}: FixedEdgeProps) => {
    const isNewlyAdded = data?.isNewlyAdded || false;

    const pathRef = useRef<SVGPathElement>(null);
    const viewStore = useViewStore();
    const isSelected = viewStore.selectedEdge?.id === id;

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
        } else {
            if (pathRef.current) {
                pathRef.current.style.strokeDasharray = "none";
                pathRef.current.style.strokeDashoffset = "none";
                pathRef.current.style.animation = "none";
            }
        }
    }, [isNewlyAdded]);

    return (
        // Using svg instead of base edge component for more control
        <svg
            className={cn(
                "transition-all fill-none duration-1000 dark:brightness-[0.87]",
            )}
        >
            {/* transparent for increase click area */}
            <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                strokeLinecap="round"
                className="cursor-pointer"
            />

            {/* actual edge */}
            <path
                ref={pathRef}
                d={path}
                style={{
                    transition: "opacity 1s, stroke-width .3s, stroke 1s",
                    ...style,
                }}
                className={cn("hover:stroke-[7]", {
                    "stroke-[5]": !isSelected,
                    "stroke-[7]": isSelected,
                })}
            />

            {/* animated light effect when selected */}
            {isSelected && (
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
