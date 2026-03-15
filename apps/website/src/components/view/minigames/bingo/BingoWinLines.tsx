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

                return (
                    <g key={idx}>
                        <line
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="#a01200"
                            strokeWidth="0.5rem"
                            strokeLinecap="round"
                        />
                        <line
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="#fcbe62"
                            strokeWidth="0.25rem"
                            strokeLinecap="round"
                        />
                    </g>
                );
            })}
        </svg>
    );
};

export default BingoWinLines;
