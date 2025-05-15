interface Props {
    style: React.CSSProperties;
    showMarker?: boolean;
}

export default function LineSvg({ style, showMarker = false }: Props) {
    const width = 60;
    const height = 20;
    const strokeColor = style?.stroke || "black";
    return (
        <svg width={width} height={height}>
            <defs>
                <marker
                    id={`markerArrow`}
                    viewBox="0 0 10 10"
                    refX="9" // Adjust reference point for correct positioning
                    refY="5" // Adjust to center the arrow on the line
                    markerWidth="4"
                    markerHeight="4"
                    className="stroke-[1]"
                    orient="auto-start-reverse" // Automatically orient the marker based on line direction
                >
                    <path d="M0,0 L10,5 L0,10 z" fill={strokeColor} />
                </marker>
            </defs>
            <line
                x1="0"
                y1="10"
                x2={width}
                y2="10"
                stroke={strokeColor}
                style={style}
                strokeWidth={4}
                markerEnd={showMarker ? "url(#markerArrow)" : ""}
            />
        </svg>
    );
}
