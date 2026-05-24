import type { TeamData, LocalizedString } from "./types";
import { talentById } from "./data";
import { MemberAvatar } from "@/components/view/stats/MemberAvatar";
import { FactionsSummary } from "@/components/view/stats/FactionsSummary";
import { useSettingStore } from "@/store/settingStore";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { SectionLabel } from "./TeamSection";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

interface FactionsSectionProps {
    factions?: TeamData[];
    currentDay: number;
}

export function FactionsSection({
    factions = [],
    currentDay,
}: FactionsSectionProps) {
    const locale = useSettingStore((state) => state.locale);
    const t = useTranslations("modals.stats");

    return (
        <section>
            <div className="flex items-center justify-between mb-2.5">
                <SectionLabel>{t("factions")}</SectionLabel>
                <FactionsSummary currentDay={currentDay} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                    {factions.map((faction, factionIndex) => {
                        const unique = [...new Set(faction.members)];
                        const factionName = getLocalizedText(
                            faction.name,
                            locale,
                        );

                        return (
                            <motion.div
                                key={factionIndex}
                                layoutId={`faction-${factionIndex}`}
                                className="border rounded-xl p-3 flex flex-col gap-2"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-xs font-medium text-muted-foreground underline underline-offset-2">
                                        {factionName}
                                    </span>
                                    {faction.image && (
                                        <Image
                                            src={faction.image}
                                            alt={factionName}
                                            width={10}
                                            height={10}
                                            className="w-5 h-5 rounded object-cover"
                                        />
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    <AnimatePresence>
                                        {unique.map((id) => {
                                            const talent = talentById(id);
                                            return talent ? (
                                                <motion.div
                                                    key={id}
                                                    layoutId={`faction-member-${id}`}
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
