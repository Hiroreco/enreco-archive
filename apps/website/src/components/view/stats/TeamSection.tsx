import type { TeamData, LocalizedString } from "./types";
import { talentById } from "./data";
import { MemberAvatar } from "@/components/view/stats/MemberAvatar";
import { useSettingStore } from "@/store/settingStore";
import { motion, AnimatePresence } from "framer-motion";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

interface TeamsSectionProps {
    teams: TeamData[];
}

export function TeamsSection({ teams }: TeamsSectionProps) {
    const locale = useSettingStore((state) => state.locale);
    return (
        <section>
            <SectionLabel>Teams</SectionLabel>
            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                layout
            >
                {teams.map((team, teamIndex) => {
                    const unique = [...new Set(team.members)];
                    const teamName = getLocalizedText(team.name, locale);
                    return (
                        <motion.div
                            key={teamIndex}
                            layoutId={`team-${teamIndex}`}
                            className="
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                rounded-xl p-3 flex flex-col gap-2
              "
                            layout
                        >
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                {teamName}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                <AnimatePresence>
                                    {unique.map((id) => {
                                        const talent = talentById(id);
                                        return talent ? (
                                            <motion.div
                                                key={id}
                                                layoutId={`member-${id}`}
                                                initial={{
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                }}
                                                transition={{ duration: 0.3 }}
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
            </motion.div>
        </section>
    );
}

// Shared section label — kept local to avoid a tiny standalone file
export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2.5">
            {children}
        </p>
    );
}
