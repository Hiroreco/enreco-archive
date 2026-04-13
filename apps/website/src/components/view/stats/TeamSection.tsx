import type { TeamData } from "./types";
import { talentById } from "./data";
import { MemberAvatar } from "@/components/view/stats/MemberAvatar";

interface TeamsSectionProps {
    teams: TeamData[];
}

export function TeamsSection({ teams }: TeamsSectionProps) {
    return (
        <section>
            <SectionLabel>Teams</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {teams.map((team) => {
                    const unique = [...new Set(team.members)];
                    return (
                        <div
                            key={team.name}
                            className="
                bg-white dark:bg-neutral-900
                border border-neutral-200 dark:border-neutral-800
                rounded-xl p-3 flex flex-col gap-2
              "
                        >
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                {team.name}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {unique.map((id) => {
                                    const talent = talentById(id);
                                    return talent ? (
                                        <MemberAvatar
                                            key={id}
                                            talent={talent}
                                            size={40}
                                        />
                                    ) : null;
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
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
