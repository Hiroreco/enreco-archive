import type { ContinuousChoice, DayData } from "./types";
import { talentById, TALENTS } from "./data";
import { SectionLabel } from "@/components/view/stats/TeamSection";
import { BarRow } from "@/components/view/stats/StatBar";

interface ContinuousSectionProps {
    continuous: ContinuousChoice[];
    /** Previous day's data — used to compute deltas */
    prevData?: DayData | null;
}

export function ContinuousSection({
    continuous,
    prevData,
}: ContinuousSectionProps) {
    const total = TALENTS.length;

    return (
        <section>
            <SectionLabel>
                Continuous choices{" "}
                <span className="normal-case font-normal tracking-normal text-neutral-400 dark:text-neutral-600">
                    — can change between days
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
                            className="
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                rounded-xl p-4 flex flex-col gap-3
              "
                        >
                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                {cont.title}
                            </span>

                            <div className="flex flex-col gap-3">
                                {cont.options.map((opt) => {
                                    const prevOpt = prevCont?.options.find(
                                        (o) => o.label === opt.label,
                                    );
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

                                    return (
                                        <BarRow
                                            key={opt.label}
                                            label={opt.label}
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
