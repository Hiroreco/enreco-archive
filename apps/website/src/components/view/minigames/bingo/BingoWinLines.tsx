// BingoWinLines.tsx
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
    if (cols[0] < cols[4]) return "diagonal-down";
    return "diagonal-up";
};

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
    cellSize?: number;
    gap?: number;
    className?: string;
}

const BingoWinLines = ({
    marked,
    cellSize = 96,
    gap = 4,
    className,
}: BingoWinLinesProps) => {
    const total = cellSize * 5 + gap * 4;
    const winningLines = LINES.filter((line) => line.every((i) => marked[i]));

    if (winningLines.length === 0) return null;

    const center = (i: number) => ({
        x: (i % 5) * (cellSize + gap) + cellSize / 2,
        y: Math.floor(i / 5) * (cellSize + gap) + cellSize / 2,
    });

    return (
        <svg
            className={className}
            style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 10,
            }}
            width={total}
            height={total}
            viewBox={`0 0 ${total} ${total}`}
        >
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
                    14,
                );

                return (
                    <g key={idx}>
                        <path
                            d={path}
                            fill="none"
                            stroke="#a01200"
                            strokeWidth={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            pathLength="1"
                        />
                        <path
                            d={path}
                            fill="none"
                            stroke="#fcbe62"
                            strokeWidth={4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            pathLength="1"
                        />
                    </g>
                );
            })}
        </svg>
    );
};

export default BingoWinLines;
