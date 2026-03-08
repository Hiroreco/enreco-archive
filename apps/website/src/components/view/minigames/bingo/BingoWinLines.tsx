import { cn } from "@enreco-archive/common-ui/lib/utils";

const LINES = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
];

type LineType = "horizontal" | "vertical" | "diagonal-down" | "diagonal-up";

const getLineType = (line: number[]): LineType => {
    const rows = line.map((i) => Math.floor(i / 5));
    const cols = line.map((i) => i % 5);
    if (new Set(rows).size === 1) return "horizontal";
    if (new Set(cols).size === 1) return "vertical";
    // diagonal-down: top-left to bottom-right (col increases with row)
    if (cols[0] < cols[4]) return "diagonal-down";
    return "diagonal-up";
};

// Build a zigzag SVG path between two points
// The zigzag wiggles perpendicular to the line direction
const zigzagPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    amplitude: number = 6,
    segments: number = 14,
): string => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    // Perpendicular unit vector
    const px = -dy / len;
    const py = dx / len;

    let d = `M ${x1} ${y1}`;
    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        const sign = i % 2 === 0 ? 1 : -1;
        const wx = cx + px * amplitude * sign;
        const wy = cy + py * amplitude * sign;
        d += ` L ${wx} ${wy}`;
    }
    d += ` L ${x2} ${y2}`;
    return d;
};

interface BingoWinLinesProps {
    marked: boolean[];
    className?: string;
    // Size of one cell in px (the grid is 5x5 with gap-1 = 4px gaps)
    cellSize?: number;
    gap?: number;
}

const BingoWinLines = ({
    marked,
    className,
    cellSize = 96, // matches md:size-24
    gap = 4,
}: BingoWinLinesProps) => {
    const total = cellSize * 5 + gap * 4;

    const winningLines = LINES.filter((line) => line.every((i) => marked[i]));

    if (winningLines.length === 0) return null;

    // Center of cell at grid index i
    const center = (i: number) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return {
            x: col * (cellSize + gap) + cellSize / 2,
            y: row * (cellSize + gap) + cellSize / 2,
        };
    };

    return (
        <svg
            className={cn("absolute inset-0 pointer-events-none", className)}
            width={total}
            height={total}
            viewBox={`0 0 ${total} ${total}`}
            style={{ zIndex: 10 }}
        >
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            {winningLines.map((line, idx) => {
                const start = center(line[0]);
                const end = center(line[4]);
                const type = getLineType(line);
                const amplitude =
                    type === "horizontal" || type === "vertical" ? 6 : 7;
                const path = zigzagPath(
                    start.x,
                    start.y,
                    end.x,
                    end.y,
                    amplitude,
                    16,
                );

                return (
                    <g key={idx}>
                        {/* Main zigzag — solid, animates via clipPath progress */}
                        <path
                            d={path}
                            fill="none"
                            stroke="#FFD700"
                            strokeWidth={7}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            pathLength="1"
                            strokeDasharray="1"
                            strokeDashoffset="1"
                            style={{
                                animation: `draw-line 1s ease-out ${idx * 0.15}s forwards`,
                            }}
                        />
                        {/* White core */}
                        <path
                            d={path}
                            fill="none"
                            stroke="white"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            pathLength="1"
                            strokeDasharray="1"
                            strokeDashoffset="1"
                            style={{
                                animation: `draw-line 1s ease-out ${idx * 0.15}s forwards`,
                            }}
                        />
                    </g>
                );
            })}
            <style>{`
                @keyframes draw-line {
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </svg>
    );
};

export default BingoWinLines;
