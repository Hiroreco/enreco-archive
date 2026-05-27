import { StatBar } from "@/components/view/stats/StatBar";
import { SectionLabel } from "@/components/view/stats/TeamSection";
import { useSettingStore } from "@/store/settingStore";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { getTalentForDay, TRACKER_DATA } from "./data";
import { MemberAvatar } from "./MemberAvatar";
import type { Choice, ChoiceType, LocalizedString } from "./types";
import { Button } from "@enreco-archive/common-ui/components/button";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

// Colors cycled for multi / yesno options
const OPTION_COLORS = [
    "#1D9E75",
    "#E24B4A",
    "#378ADD",
    "#BA7517",
    "#7F77DD",
    "#D4537E",
];

const BADGE_STYLES: Record<ChoiceType, string> = {
    yesno: "bg-emerald-50  text-emerald-800  dark:bg-emerald-950  dark:text-emerald-300",
    multi: "bg-violet-50   text-violet-800   dark:bg-violet-950   dark:text-violet-300",
    opinion:
        "bg-amber-50    text-amber-800    dark:bg-amber-950    dark:text-amber-300",
};

function TypeBadge({ type }: { type: ChoiceType }) {
    const t = useTranslations("modals.stats.choiceTypes");
    const labels: Record<ChoiceType, string> = {
        yesno: t("yesno"),
        multi: t("multi"),
        opinion: t("opinion"),
    };

    return (
        <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${BADGE_STYLES[type]}`}
        >
            {labels[type]}
        </span>
    );
}

const OPINION_PREVIEW = 4;

function OpinionModal({
    choice,
    open,
    onOpenChange,
    currentDay,
}: {
    choice: Choice;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentDay: number;
}) {
    const tCommon = useTranslations("common");
    const locale = useSettingStore((state) => state.locale);
    const opinions = choice.opinions ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogTitle className="text-base font-semibold mb-4">
                    {getLocalizedText(choice.question, locale)}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    All responses to this question
                </DialogDescription>
                <div className="flex flex-col gap-2  max-h-[70dvh] overflow-y-auto px-2">
                    {opinions.map((entry) => {
                        const talent = getTalentForDay(entry.talent, currentDay);
                        if (!talent) return null;
                        return (
                            <div
                                key={entry.talent}
                                className="flex gap-2 items-start bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2"
                            >
                                <MemberAvatar
                                    talent={talent}
                                    size={26}
                                    showTooltip={false}
                                />
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span
                                        className="text-[10px] font-medium leading-none"
                                        style={{ color: talent.color }}
                                    >
                                        {getLocalizedText(talent.name, locale)}
                                    </span>
                                    <span className="text-[11px] leading-snug">
                                        {getLocalizedText(entry.text, locale)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <DialogFooter className="border-t pt-2">
                    <DialogClose asChild>
                        <Button>{tCommon("close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function OpinionBody({ choice, currentDay }: { choice: Choice; currentDay: number }) {
    const locale = useSettingStore((state) => state.locale);
    const t = useTranslations("modals.stats");
    const [modalOpen, setModalOpen] = useState(false);
    const opinions = choice.opinions ?? [];
    const visible = opinions.slice(0, OPINION_PREVIEW);
    const remaining = opinions.length - OPINION_PREVIEW;

    return (
        <>
            <div className="flex flex-col gap-1.5">
                {visible.map((entry) => {
                    const talent = getTalentForDay(entry.talent, currentDay);
                    if (!talent) return null;
                    return (
                        <div
                            key={entry.talent}
                            className="flex gap-2 items-start bg-neutral-50 dark:bg-neutral-800 rounded-lg px-3 py-2"
                        >
                            <MemberAvatar
                                talent={talent}
                                size={26}
                                showTooltip={false}
                            />
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span
                                    className="text-[10px] font-medium leading-none"
                                    style={{ color: talent.color }}
                                >
                                    {getLocalizedText(talent.name, locale)}
                                </span>
                                <span className="text-[11px] leading-snug">
                                    {getLocalizedText(entry.text, locale)}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {remaining > 0 && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 text-left transition-colors mt-0.5"
                    >
                        {t("moreResponses", { count: remaining })}
                    </button>
                )}
            </div>
            <OpinionModal
                choice={choice}
                open={modalOpen}
                onOpenChange={setModalOpen}
                currentDay={currentDay}
            />
        </>
    );
}

function BarBody({ choice, currentDay }: { choice: Choice; currentDay: number }) {
    const locale = useSettingStore((state) => state.locale);
    const options = choice.options ?? [];
    const totalVotes = options.reduce((s, o) => s + o.members.length, 0);

    return (
        <div className="flex flex-col gap-3">
            {options.map((opt, i) => {
                const color = OPTION_COLORS[i % OPTION_COLORS.length];
                const memberTalents = opt.members
                    .map((memberId) => getTalentForDay(memberId, currentDay))
                    .filter(Boolean) as NonNullable<
                    ReturnType<typeof getTalentForDay>
                >[];
                const label = getLocalizedText(opt.label, locale);

                return (
                    <StatBar
                        key={label}
                        label={label}
                        count={opt.members.length}
                        total={totalVotes}
                        color={color}
                        members={memberTalents}
                        dotSize={18}
                    />
                );
            })}
        </div>
    );
}

function ChoiceCard({ choice, currentDay }: { choice: Choice; currentDay: number }) {
    const locale = useSettingStore((state) => state.locale);
    return (
        <div className="border rounded-xl p-4 flex flex-col gap-3">
            {/* <TypeBadge type={choice.type} /> */}
            <p className="text-sm font-medium leading-snug">
                {getLocalizedText(choice.question, locale)}
            </p>

            {choice.type === "opinion" ? (
                <OpinionBody choice={choice} currentDay={currentDay} />
            ) : (
                <BarBody choice={choice} currentDay={currentDay} />
            )}
        </div>
    );
}

interface ChoicesSectionProps {
    choices: Choice[];
    currentDay: number;
}

export function ChoicesSection({ choices, currentDay }: ChoicesSectionProps) {
    const t = useTranslations("modals.stats");

    // Find latest day with choices if current day has none
    const hasData = choices.length > 0;
    let fallbackData: Choice[] | null = null;
    let fallbackDay = -1;

    if (!hasData) {
        for (let day = currentDay - 1; day >= 1; day--) {
            const dayData = TRACKER_DATA[day];
            if (dayData && dayData.choices.length > 0) {
                fallbackData = dayData.choices;
                fallbackDay = day;
                break;
            }
        }
    }

    const displayData = hasData ? choices : fallbackData;
    const dataDay = hasData ? currentDay : fallbackDay;

    if (!displayData || displayData.length === 0) {
        return null; // No data found even in fallback
    }

    return (
        <section className={hasData ? "" : "opacity-50 relative"}>
            {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="bg-background/90 rounded-lg px-4 py-2 text-sm font-medium border">
                        {t("noOneTimeChoices")}
                    </div>
                </div>
            )}
            <SectionLabel>{t("oneTimeChoices")}</SectionLabel>
            <div
                className={`grid grid-cols-1 gap-3 ${
                    displayData.length === 1
                        ? ""
                        : displayData.length === 2
                          ? "sm:grid-cols-2"
                          : "sm:grid-cols-2 xl:grid-cols-3"
                }`}
            >
                {displayData.map((choice) => (
                    <ChoiceCard
                        key={choice.id}
                        choice={choice}
                        currentDay={dataDay}
                    />
                ))}
            </div>
        </section>
    );
}
