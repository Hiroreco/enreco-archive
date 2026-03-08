import { useMemo } from "react";

function seededRng(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = Math.imul(s ^ (s >>> 15), s | 1);
        s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
        return ((s ^ (s >>> 14)) >>> 0) / 0xffffffff;
    };
}

function generateShards(seed: number, count = 8): string[] {
    const rng = seededRng(seed);

    // Random interior seed points (as percentages)
    const seeds = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
        ...Array.from({ length: count }, () => ({
            x: 15 + rng() * 70,
            y: 15 + rng() * 70,
        })),
    ];

    // Voronoi: sample a grid, assign each point to nearest seed
    const res = 30;
    const buckets: Map<number, { x: number; y: number }[]> = new Map(
        seeds.map((_, i) => [i, []]),
    );
    for (let row = 0; row <= res; row++) {
        for (let col = 0; col <= res; col++) {
            const px = (col / res) * 100;
            const py = (row / res) * 100;
            let nearest = 0,
                minD = Infinity;
            seeds.forEach((s, i) => {
                const d = (px - s.x) ** 2 + (py - s.y) ** 2;
                if (d < minD) {
                    minD = d;
                    nearest = i;
                }
            });
            buckets.get(nearest)!.push({ x: px, y: py });
        }
    }

    // Convex hull per bucket → shrink inward → CSS polygon string
    return seeds
        .map((_, i) => {
            const pts = buckets.get(i)!;
            if (pts.length < 3) return null;
            const hull = convexHull(pts);
            if (hull.length < 3) return null;

            const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
            const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
            const GAP = 2.5; // percentage gap between shards

            const shrunk = hull.map((p) => {
                const dx = p.x - cx,
                    dy = p.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const pull = Math.max(0, dist - GAP) / dist;
                return { x: cx + dx * pull, y: cy + dy * pull };
            });

            return (
                "polygon(" +
                shrunk
                    .map((p) => `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`)
                    .join(", ") +
                ")"
            );
        })
        .filter(Boolean) as string[];
}

function convexHull(pts: { x: number; y: number }[]) {
    const sorted = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
    const cross = (
        o: (typeof pts)[0],
        a: (typeof pts)[0],
        b: (typeof pts)[0],
    ) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower: typeof pts = [];
    for (const p of sorted) {
        while (lower.length >= 2 && cross(lower.at(-2)!, lower.at(-1)!, p) <= 0)
            lower.pop();
        lower.push(p);
    }
    const upper: typeof pts = [];
    for (const p of [...sorted].reverse()) {
        while (upper.length >= 2 && cross(upper.at(-2)!, upper.at(-1)!, p) <= 0)
            upper.pop();
        upper.push(p);
    }
    upper.pop();
    lower.pop();
    return [...lower, ...upper];
}

interface BingoShatterCellProps {
    cellIndex: number;
    shattered: boolean;
    children: React.ReactNode;
}

const BingoShatterCell = ({
    cellIndex,
    shattered,
    children,
}: BingoShatterCellProps) => {
    const shards = useMemo(
        () => generateShards(cellIndex * 137 + 42),
        [cellIndex],
    );

    if (!shattered) return <>{children}</>;

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Void — shows in the cracks */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "transparent",
                }}
            />

            {/* One copy of the cell per shard, each clipped to its polygon */}
            {shards.map((clipPath, i) => (
                <div
                    key={i}
                    style={{
                        position: "absolute",
                        inset: 0,
                        clipPath,
                    }}
                >
                    {children}
                </div>
            ))}
        </div>
    );
};

export default BingoShatterCell;
