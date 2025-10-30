import { cn } from "@enreco-archive/common-ui/lib/utils";
import { FixedEdgeProps } from "@enreco-archive/common/types";
import { generatePath } from "@enreco-archive/common/utils/get-edge-svg-path";
import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";

import "./CustomEdge.css";
import { CurrentChapterDataContext } from "@/contexts/CurrentChartData";

const CustomEdge = ({
    id,
    style,
    data,
    selectable,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    selected,
}: FixedEdgeProps) => {
    const isNewlyAdded = data?.isNewlyAdded || false;
    const maskId = `${id}-newly-added-mask`;
    const pathRef = useRef<SVGPathElement>(null);
    const [maskBounds, setMaskBounds] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });

    const { relationships } = useContext(CurrentChapterDataContext);
    const relationshipStyle = data
        ? (relationships[data?.relationshipId]?.style ?? {})
        : {};

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
        if (pathRef.current) {
            const bbox = pathRef.current.getBBox();
            const padding = 3;
            setMaskBounds({
                x: bbox.x - padding,
                y: bbox.y - padding,
                width: bbox.width + padding * 2,
                height: bbox.height + padding * 2,
            });
        }
    }, []);

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
        <g>
            <defs>
                {relationshipStyle.strokeDasharray && (
                    <mask
                        id={maskId}
                        x={maskBounds.x}
                        y={maskBounds.y}
                        width={maskBounds.width}
                        height={maskBounds.height}
                        maskUnits={"userSpaceOnUse"}
                    >
                        <path
                            d={path}
                            stroke="white"
                            strokeWidth={selected ? 7 : 5}
                            strokeDasharray={relationshipStyle.strokeDasharray}
                            fill="none"
                            strokeLinecap="round"
                            className={cn({
                                "custom-edge": !selected,
                                "custom-edge-selected": selected,
                            })}
                        />
                    </mask>
                )}
            </defs>

            {/* Transparent click area */}
            {selectable && (
                <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={25}
                    strokeLinecap="round"
                />
            )}

            {/* Actual edge */}
            <path
                ref={pathRef}
                d={path}
                style={{
                    ...relationshipStyle,
                    ...style,
                    transition: "opacity 1s, stroke-width .3s, stroke 1s",
                    zIndex: 0,
                }}
                className={cn({
                    "custom-edge": !selected,
                    "custom-edge-selected": selected,
                })}
                mask={
                    relationshipStyle.strokeDasharray
                        ? `url(#${maskId})`
                        : undefined
                }
            />

            {selected && (
                <path
                    d={path}
                    stroke="white"
                    strokeWidth={9}
                    strokeLinecap="round"
                    fill="none"
                    className="running-light"
                    style={{
                        zIndex: 10,
                        filter: "drop-shadow(0 0 3px rgba(255,255,255,0.7))",
                    }}
                />
            )}
        </g>
    );
};

export default memo(CustomEdge);
