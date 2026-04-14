"use client";

import { useTranslations } from "next-intl";
import type { ContinuousChoice, LocalizedString } from "./types";
import { TRACKER_DATA, talentById } from "./data";
import { MemberAvatar } from "@/components/view/stats/MemberAvatar";
import { useSettingStore } from "@/store/settingStore";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@enreco-archive/common-ui/components/dropdownmenu";
import { ChevronDown } from "lucide-react";
import { Button } from "@enreco-archive/common-ui/components/button";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

interface ContinuousSummaryProps {
    choiceId: string;
    choiceTitle: LocalizedString | string;
    currentDay: number;
}

export function ContinuousSummary({
    choiceId,
    choiceTitle,
    currentDay,
}: ContinuousSummaryProps) {
    const locale = useSettingStore((state) => state.locale);
    const t = useTranslations("modals.stats");

    const calculateChoiceChanges = (day: number) => {
        if (day === 1) {
            return [
                { member: t("everyone"), change: t("everyoneInitialChoice") },
            ];
        }

        const prevData = TRACKER_DATA[day - 1];
        const currData = TRACKER_DATA[day];
        if (!prevData || !currData) return [];

        const prevChoice = prevData.continuous.find((c) => c.id === choiceId);
        const currChoice = currData.continuous.find((c) => c.id === choiceId);

        if (!prevChoice || !currChoice) return [];

        const changes: Array<{ member: string; from: string; to: string }> = [];

        // Find all members and check if their option changed
        const allMembers = new Set<string>();
        [...prevChoice.options, ...currChoice.options].forEach((opt) => {
            opt.members.forEach((m) => allMembers.add(m));
        });

        allMembers.forEach((memberId) => {
            const prevOpt = prevChoice.options.find((o) =>
                o.members.includes(memberId),
            );
            const currOpt = currChoice.options.find((o) =>
                o.members.includes(memberId),
            );

            if (prevOpt && currOpt && prevOpt.label !== currOpt.label) {
                const prevLabel = getLocalizedText(prevOpt.label, locale);
                const currLabel = getLocalizedText(currOpt.label, locale);
                changes.push({
                    member: memberId,
                    from: prevLabel,
                    to: currLabel,
                });
            }
        });

        return changes;
    };

    const dayChanges = Array.from({ length: currentDay }, (_, i) => {
        const rawChanges = calculateChoiceChanges(i + 1);

        // Check if any change is a "day 1" style change
        const hasChangeStyleEntry = rawChanges.some((c) => "change" in c);
        if (hasChangeStyleEntry) {
            return {
                day: i + 1,
                changes: rawChanges,
            };
        }

        // Group transition-style changes by "from -> to"
        const grouped: Array<{
            members: string[];
            from: string;
            to: string;
            fromColor: string;
            toColor: string;
        }> = [];

        rawChanges.forEach((rawChange) => {
            if (!("from" in rawChange)) return;

            const change = rawChange as {
                member: string;
                from: string;
                to: string;
            };

            // Find the option colors
            const currData = TRACKER_DATA[i + 1];
            const choice = currData?.continuous.find((c) => c.id === choiceId);
            const fromOpt = choice?.options.find(
                (o) => getLocalizedText(o.label, locale) === change.from,
            );
            const toOpt = choice?.options.find(
                (o) => getLocalizedText(o.label, locale) === change.to,
            );
            const fromColor = fromOpt?.color || "#888";
            const toColor = toOpt?.color || "#888";

            const existing = grouped.find(
                (g) => g.from === change.from && g.to === change.to,
            );

            if (existing) {
                existing.members.push(change.member);
            } else {
                grouped.push({
                    members: [change.member],
                    from: change.from,
                    to: change.to,
                    fromColor,
                    toColor,
                });
            }
        });

        return { day: i + 1, changes: grouped };
    });

    const titleStr = getLocalizedText(choiceTitle, locale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-muted-foreground"
                >
                    {t("changes")}
                    <ChevronDown className="ml-1.5 h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 space-y-4 max-h-80 overflow-y-auto">
                    <DropdownMenuLabel className="px-0 text-xs font-semibold text-foreground">
                        {titleStr}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {dayChanges.map(({ day, changes }) => (
                        <div key={day}>
                            <DropdownMenuLabel className="px-0 text-xs">
                                Day {day}
                            </DropdownMenuLabel>
                            {changes.length === 0 ? (
                                <p className="text-xs text-muted-foreground ml-2 mb-0">
                                    No changes
                                </p>
                            ) : (
                                <ul className="text-xs space-y-2 ml-2 mb-3">
                                    {changes.map((change, idx) => {
                                        if ("change" in change) {
                                            // Day 1 format
                                            const dayChange = change as {
                                                member: string;
                                                change: string;
                                            };
                                            return (
                                                <li
                                                    key={idx}
                                                    className="text-muted-foreground list-none"
                                                >
                                                    {dayChange.member}{" "}
                                                    {dayChange.change}
                                                </li>
                                            );
                                        } else {
                                            // Grouped format
                                            const groupedChange = change as {
                                                members: string[];
                                                from: string;
                                                to: string;
                                                fromColor: string;
                                                toColor: string;
                                            };
                                            return (
                                                <li
                                                    key={idx}
                                                    className="flex items-center gap-1 text-muted-foreground flex-wrap list-none"
                                                >
                                                    <div className="flex gap-1">
                                                        {groupedChange.members.map(
                                                            (memberId) => {
                                                                const talent =
                                                                    talentById(
                                                                        memberId,
                                                                    );
                                                                return talent ? (
                                                                    <MemberAvatar
                                                                        key={
                                                                            memberId
                                                                        }
                                                                        talent={
                                                                            talent
                                                                        }
                                                                        size={
                                                                            24
                                                                        }
                                                                        showTooltip={
                                                                            true
                                                                        }
                                                                    />
                                                                ) : null;
                                                            },
                                                        )}
                                                    </div>
                                                    <span>changed from</span>
                                                    <span
                                                        style={{
                                                            color: groupedChange.fromColor,
                                                        }}
                                                        className="font-medium"
                                                    >
                                                        {groupedChange.from}
                                                    </span>
                                                    <span>to</span>
                                                    <span
                                                        style={{
                                                            color: groupedChange.toColor,
                                                        }}
                                                        className="font-medium"
                                                    >
                                                        {groupedChange.to}
                                                    </span>
                                                </li>
                                            );
                                        }
                                    })}
                                </ul>
                            )}
                            {day < currentDay && <DropdownMenuSeparator />}
                        </div>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
