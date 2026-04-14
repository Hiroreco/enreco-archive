import type { ContinuousChoice, DayData, LocalizedString } from "./types";
import { talentById, TALENTS } from "./data";
import { SectionLabel } from "@/components/view/stats/TeamSection";
import { StatBar } from "@/components/view/stats/StatBar";
import { ContinuousSummary } from "@/components/view/stats/ContinuousSummary";
import { useSettingStore } from "@/store/settingStore";
import { useTranslations } from "next-intl";
import { TRACKER_DATA } from "./data";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

interface ContinuousSectionProps {
    continuous: ContinuousChoice[];
    /** Previous day's data — used to compute deltas */
    prevData?: DayData | null;
    /** Current day for fallback logic */
    currentDay: number;
}

export function ContinuousSection({
    continuous,
    prevData,
    currentDay,
}: ContinuousSectionProps) {
    const locale = useSettingStore((state) => state.locale);
    const t = useTranslations("modals.stats");
    const total = TALENTS.length;

    // Find latest day with continuous choices if current day has none
    const hasData = continuous.length > 0;
    let fallbackData: ContinuousChoice[] | null = null;
    let fallbackDay = -1;

    if (!hasData) {
        for (let day = currentDay - 1; day >= 1; day--) {
            const dayData = TRACKER_DATA[day];
            if (dayData && dayData.continuous.length > 0) {
                fallbackData = dayData.continuous;
                fallbackDay = day;
                break;
            }
        }
    }

    const displayData = hasData ? continuous : fallbackData;

    if (!displayData || displayData.length === 0) {
        return null; // No data found even in fallback
    }

    return (
        <section className={hasData ? "" : "opacity-50 relative"}>
            {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-background/90 rounded-lg px-4 py-2 text-sm font-medium border">
                        {t("noContinuousChoices")}
                    </div>
                </div>
            )}
            <SectionLabel>
                {t("continuousChoices")}{" "}
                <span className="normal-case font-normal tracking-normal">
                    {t("continuousDescription")}
                </span>
            </SectionLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayData.map((cont) => {
                    const prevCont = prevData?.continuous.find(
                        (c) => c.id === cont.id,
                    );

                    return (
                        <div
                            key={cont.id}
                            className="border rounded-xl p-4 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {getLocalizedText(cont.title, locale)}
                                </span>
                                <ContinuousSummary
                                    choiceId={cont.id}
                                    choiceTitle={cont.title}
                                    currentDay={currentDay}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                {cont.options.map((opt, optIndex) => {
                                    const prevOpt = prevCont?.options[optIndex];
                                    const delta =
                                        prevOpt !== undefined
                                            ? opt.members.length -
                                              prevOpt.members.length
                                            : undefined;

                                    const memberTalents = opt.members
                                        .map(talentById)
                                        .filter(Boolean) as NonNullable<
                                        ReturnType<typeof talentById>
                                    >[];

                                    const label = getLocalizedText(
                                        opt.label,
                                        locale,
                                    );

                                    return (
                                        <StatBar
                                            key={label}
                                            label={label}
                                            count={opt.members.length}
                                            total={total}
                                            color={opt.color}
                                            members={memberTalents}
                                            delta={delta}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
