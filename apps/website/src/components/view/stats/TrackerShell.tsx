import { ChoicesSection } from "@/components/view/stats/ChoicesSection";
import { ContinuousSection } from "@/components/view/stats/ContinuousSection";
import { TRACKER_DATA } from "@/components/view/stats/data";
import { TeamsSection } from "@/components/view/stats/TeamSection";

export function TrackerShell({
    day,
    onDayChange,
}: {
    day: number;
    onDayChange: (day: number) => void;
}) {
    const data = TRACKER_DATA[day];
    const prevData = day > 1 ? (TRACKER_DATA[day - 1] ?? null) : null;

    // If data is missing for a day, show a placeholder
    if (!data) {
        return (
            <div className="py-12 text-center text-sm">
                No data yet for Day {day}.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4">
            <ContinuousSection
                continuous={data.continuous}
                prevData={prevData}
            />
            <ChoicesSection choices={data.choices} />
        </div>
    );
}
