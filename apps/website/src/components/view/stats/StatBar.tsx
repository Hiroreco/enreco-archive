import type { Talent } from "./types";
import { MemberDot } from "./MemberDot";

interface BarRowProps {
    label: string;
    count: number;
    total: number;
    color: string;
    members: Talent[];
    /** Optional change vs previous day (+N / -N). Omit to hide. */
    delta?: number;
    dotSize?: number;
}

export function BarRow({
    label,
    count,
    total,
    color,
    members,
    delta,
    dotSize = 18,
}: BarRowProps) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="flex flex-col gap-1">
            {/* Label row */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {label}
                </span>
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                    {count}
                    {delta !== undefined && delta !== 0 && (
                        <span
                            className="text-[10px]"
                            style={{ color: delta > 0 ? "#1D9E75" : "#E24B4A" }}
                        >
                            {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                        </span>
                    )}
                </span>
            </div>

            {/* Bar */}
            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                    className="h-full rounded-full transition-[width] duration-500 ease-in-out"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>

            {/* Member dots */}
            {members.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                    {members.map((t) => (
                        <MemberDot
                            key={t.id}
                            talent={t}
                            accentColor={color}
                            size={dotSize}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
