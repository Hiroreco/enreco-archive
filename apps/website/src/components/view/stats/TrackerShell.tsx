import { ChoicesSection } from "@/components/view/stats/ChoicesSection";
import { ContinuousSection } from "@/components/view/stats/ContinuousSection";
import { TOTAL_DAYS, TRACKER_DATA } from "@/components/view/stats/data";
import { TeamsSection } from "@/components/view/stats/TeamSection";
import { useState } from "react";

export function TrackerShell() {
    const [day, setDay] = useState(1);

    const data = TRACKER_DATA[day];
    const prevData = day > 1 ? (TRACKER_DATA[day - 1] ?? null) : null;

    // If data is missing for a day, show a placeholder
    if (!data) {
        return (
            <div className="py-12 text-center text-sm text-neutral-400">
                No data yet for Day {day}.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 py-6 px-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                    Stats for nerds
                </h1>

                <div className="flex items-center gap-2.5">
                    <label
                        htmlFor="day-select"
                        className="text-xs text-neutral-500 dark:text-neutral-400"
                    >
                        Day
                    </label>
                    <select
                        id="day-select"
                        value={day}
                        onChange={(e) => setDay(Number(e.target.value))}
                        className="
              text-sm rounded-lg border border-neutral-200 dark:border-neutral-700
              bg-white dark:bg-neutral-900
              text-neutral-800 dark:text-neutral-100
              px-3 py-1.5 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600
            "
                    >
                        {Array.from(
                            { length: TOTAL_DAYS },
                            (_, i) => i + 1,
                        ).map((d) => (
                            <option key={d} value={d}>
                                Day {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <TeamsSection teams={data.teams} />
            <ContinuousSection
                continuous={data.continuous}
                prevData={prevData}
            />
            <ChoicesSection choices={data.choices} />
        </div>
    );
}
