import type { ContinuousChoice, DayData, LocalizedString } from "./types";
import { talentById, TALENTS } from "./data";
import { SectionLabel } from "@/components/view/stats/TeamSection";
import { StatBar } from "@/components/view/stats/StatBar";
import { useSettingStore } from "@/store/settingStore";
import { useTranslations } from "next-intl";

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
}

export function ContinuousSection({
    continuous,
    prevData,
}: ContinuousSectionProps) {
    const locale = useSettingStore((state) => state.locale);
    const t = useTranslations("modals.stats");
    const total = TALENTS.length;

    return (
        <section>
            <SectionLabel>
                {t("continuousChoices")}{" "}
                <span className="normal-case font-normal tracking-normal">
                    {t("continuousDescription")}
                </span>
            </SectionLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {continuous.map((cont) => {
                    const prevCont = prevData?.continuous.find(
                        (c) => c.id === cont.id,
                    );

                    return (
                        <div
                            key={cont.id}
                            className="border rounded-xl p-4 flex flex-col gap-3"
                        >
                            <span className="text-sm font-medium">
                                {getLocalizedText(cont.title, locale)}
                            </span>

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
