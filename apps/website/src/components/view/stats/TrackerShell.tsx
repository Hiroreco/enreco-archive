import { ChoicesSection } from "@/components/view/stats/ChoicesSection";
import { ContinuousSection } from "@/components/view/stats/ContinuousSection";
import { TOTAL_DAYS, TRACKER_DATA } from "@/components/view/stats/data";
import { TeamsSection } from "@/components/view/stats/TeamSection";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";

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
                    <label className="text-xs text-neutral-500 dark:text-neutral-400">
                        Day
                    </label>
                    <Select
                        value={day.toString()}
                        onValueChange={(val) => setDay(Number(val))}
                    >
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from(
                                { length: TOTAL_DAYS },
                                (_, i) => i + 1,
                            ).map((d) => (
                                <SelectItem key={d} value={d.toString()}>
                                    Day {d}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
