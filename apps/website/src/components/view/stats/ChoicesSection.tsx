import { useState } from "react";
import type { Choice, ChoiceType, LocalizedString } from "./types";
import { talentById } from "./data";
import { MemberAvatar } from "./MemberAvatar";
import { SectionLabel } from "@/components/view/stats/TeamSection";
import { StatBar } from "@/components/view/stats/StatBar";
import { useSettingStore } from "@/store/settingStore";

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

const BADGE_LABELS: Record<ChoiceType, string> = {
    yesno: "Yes / No",
    multi: "Multiple choice",
    opinion: "Open opinion",
};

function TypeBadge({ type }: { type: ChoiceType }) {
    return (
        <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${BADGE_STYLES[type]}`}
        >
            {BADGE_LABELS[type]}
        </span>
    );
}

const OPINION_PREVIEW = 4;

function OpinionBody({ choice }: { choice: Choice }) {
    const locale = useSettingStore((state) => state.locale);
    const [expanded, setExpanded] = useState(false);
    const opinions = choice.opinions ?? [];
    const visible = expanded ? opinions : opinions.slice(0, OPINION_PREVIEW);
    const remaining = opinions.length - OPINION_PREVIEW;

    return (
        <div className="flex flex-col gap-1.5">
            {visible.map((entry) => {
                const talent = talentById(entry.talent);
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

            {!expanded && remaining > 0 && (
                <button
                    onClick={() => setExpanded(true)}
                    className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 text-left transition-colors mt-0.5"
                >
                    +{remaining} more responses
                </button>
            )}
        </div>
    );
}

function BarBody({ choice }: { choice: Choice }) {
    const locale = useSettingStore((state) => state.locale);
    const options = choice.options ?? [];
    const totalVotes = options.reduce((s, o) => s + o.members.length, 0);

    return (
        <div className="flex flex-col gap-3">
            {options.map((opt, i) => {
                const color = OPTION_COLORS[i % OPTION_COLORS.length];
                const memberTalents = opt.members
                    .map(talentById)
                    .filter(Boolean) as NonNullable<
                    ReturnType<typeof talentById>
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

function ChoiceCard({ choice }: { choice: Choice }) {
    const locale = useSettingStore((state) => state.locale);
    return (
        <div className="border rounded-xl p-4 flex flex-col gap-3">
            <TypeBadge type={choice.type} />
            <p className="text-sm font-medium leading-snug">
                {getLocalizedText(choice.question, locale)}
            </p>

            {choice.type === "opinion" ? (
                <OpinionBody choice={choice} />
            ) : (
                <BarBody choice={choice} />
            )}
        </div>
    );
}

interface ChoicesSectionProps {
    choices: Choice[];
}

export function ChoicesSection({ choices }: ChoicesSectionProps) {
    return (
        <section>
            <SectionLabel>One-time choices</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {choices.map((choice) => (
                    <ChoiceCard key={choice.id} choice={choice} />
                ))}
            </div>
        </section>
    );
}
