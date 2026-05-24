"use client";

import { useTranslations } from "next-intl";
import type { TeamData, LocalizedString } from "./types";
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
import Image from "next/image";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

interface TeamsSummaryProps {
    currentDay: number;
}

export function TeamsSummary({ currentDay }: TeamsSummaryProps) {
    const locale = useSettingStore((state) => state.locale);
    const t = useTranslations("modals.stats");
    const tCommon = useTranslations("common");

    // Calculate team changes for each day
    const calculateTeamChanges = (day: number) => {
        if (day === 1) {
            return [
                {
                    member: t("everyone"),
                    change: t("everyoneInitialTeam"),
                },
            ];
        }

        const prevData = TRACKER_DATA[day - 1];
        const currData = TRACKER_DATA[day];
        if (!prevData || !currData) return [];

        const changes: Array<{ member: string; from: string; to: string }> = [];

        // Find members who moved teams
        currData.teams.forEach((curr, currTeamIdx) => {
            curr.members.forEach((memberId) => {
                const prevTeamIdx = prevData.teams.findIndex((t) =>
                    t.members.includes(memberId),
                );
                if (prevTeamIdx !== currTeamIdx) {
                    const prevTeamName =
                        prevTeamIdx >= 0 && prevData.teams[prevTeamIdx]
                            ? getLocalizedText(
                                  prevData.teams[prevTeamIdx].name,
                                  locale,
                              )
                            : tCommon("none");
                    const currTeamName = getLocalizedText(curr.name, locale);
                    changes.push({
                        member: memberId,
                        from: prevTeamName,
                        to: currTeamName,
                    });
                }
            });
        });

        return changes;
    };

    const dayChanges = Array.from({ length: currentDay }, (_, i) => {
        const day = i + 1;
        const rawChanges = calculateTeamChanges(day);

        // Check if this is a day 1 style change
        if (rawChanges.length > 0 && "change" in rawChanges[0]) {
            return {
                day,
                changes: rawChanges as Array<{
                    member: string;
                    change: string;
                }>,
            };
        }

        // Group transition-style changes by "from -> to"
        const grouped: Array<{
            members: string[];
            from: string;
            to: string;
            fromImage: string;
            toImage: string;
        }> = [];

        rawChanges.forEach((rawChange) => {
            if (!("from" in rawChange)) return;

            const change = rawChange as {
                member: string;
                from: string;
                to: string;
            };

            // Get team images from current day data
            const currData = TRACKER_DATA[day];
            const fromTeam = currData?.teams.find(
                (t) => getLocalizedText(t.name, locale) === change.from,
            );
            const toTeam = currData?.teams.find(
                (t) => getLocalizedText(t.name, locale) === change.to,
            );
            const fromImage = fromTeam?.image || "";
            const toImage = toTeam?.image || "";

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
                    fromImage,
                    toImage,
                });
            }
        });

        return { day, changes: grouped };
    });

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
                    {dayChanges.map(({ day, changes }) => (
                        <div key={day}>
                            <DropdownMenuLabel className="mb-2 px-0">
                                {tCommon("day", { val: day })}
                            </DropdownMenuLabel>
                            {changes.length === 0 ? (
                                <p className="text-xs text-muted-foreground ml-2 mb-0">
                                    {t("noChanges")}
                                </p>
                            ) : (
                                <ul className="text-xs space-y-2 ml-2">
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
                                                fromImage: string;
                                                toImage: string;
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
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: (() => {
                                                                const from =
                                                                    groupedChange.from;
                                                                const to =
                                                                    groupedChange.to;
                                                                return t(
                                                                    "movedFromTo",
                                                                    {
                                                                        from,
                                                                        to,
                                                                    },
                                                                );
                                                            })(),
                                                        }}
                                                    />
                                                </li>
                                            );
                                        }
                                    })}
                                </ul>
                            )}
                            {day < currentDay && (
                                <DropdownMenuSeparator className="mt-3" />
                            )}
                        </div>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
