import type { TeamData, LocalizedString } from "./types";
import { talentById } from "./data";
import { MemberAvatar } from "@/components/view/stats/MemberAvatar";
import { TeamsSummary } from "@/components/view/stats/TeamsSummary";
import { useSettingStore } from "@/store/settingStore";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

interface TeamsSectionProps {
    teams: TeamData[];
    currentDay: number;
}

export function TeamsSection({ teams, currentDay }: TeamsSectionProps) {
    const locale = useSettingStore((state) => state.locale);
    const t = useTranslations("modals.stats");

    return (
        <section>
            <div className="flex items-center justify-between mb-2.5">
                <SectionLabel>{t("teams")}</SectionLabel>
                <TeamsSummary currentDay={currentDay} />
            </div>
            {/*
                No `layout` on the grid — letting the grid reflow instantly
                prevents the intermediate-state jank on mobile where a row
                briefly becomes two rows mid-animation.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                    {teams.map((team, teamIndex) => {
                        const unique = [...new Set(team.members)];
                        const teamName = getLocalizedText(team.name, locale);

                        return (
                            <motion.div
                                key={teamIndex}
                                layoutId={`team-${teamIndex}`}
                                className="border rounded-xl p-3 flex flex-col gap-2"
                                /*
                                    No `layout` prop — layoutId alone handles card
                                    identity. Adding layout on top causes the grid to
                                    momentarily miscount columns while FLIP plays out,
                                    producing the two-rows-then-one-row jank on mobile.
                                */
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-medium text-muted-foreground underline underline-offset-2">
                                        {teamName}
                                    </span>
                                    {team.image && (
                                        <Image
                                            src={team.image}
                                            alt={teamName}
                                            width={10}
                                            height={10}
                                            className="w-5 h-5 rounded object-cover"
                                        />
                                    )}
                                </div>

                                {/*
                                    Plain div — animating the flex container itself
                                    is what caused avatars to briefly stack vertically
                                    on narrow screens.
                                */}
                                <div className="flex flex-wrap gap-1.5">
                                    <AnimatePresence>
                                        {unique.map((id) => {
                                            const talent = talentById(id);
                                            return talent ? (
                                                <motion.div
                                                    key={id}
                                                    layoutId={`member-${id}`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{
                                                        duration: 0.3,
                                                    }}
                                                >
                                                    <MemberAvatar
                                                        talent={talent}
                                                        size={40}
                                                    />
                                                </motion.div>
                                            ) : null;
                                        })}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </section>
    );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-medium uppercase tracking-widest mb-2.5 text-muted-foreground">
            {children}
        </p>
    );
}
