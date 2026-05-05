import ChangelogModal from "@/components/view/basic-modals/Changelog";
import { LS_KEYS } from "@/lib/constants";
import { useSettingStore } from "@/store/settingStore";
import { Locale, useTranslations } from "next-intl";
import { useState } from "react";

const getDateInLocale = (date: Date, locale: Locale): string => {
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
};

const InfoGeneral = () => {
    const t = useTranslations("modals.infoGeneral");
    const [showChangelog, setShowChangelog] = useState(false);
    const locale = useSettingStore((state) => state.locale);

    return (
        <div className="flex flex-col gap-5 pt-4">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold">{t("title")}</span>
                <div className="flex flex-wrap gap-x-1 gap-y-0.5 text-sm italic">
                    <span>
                        {t("updatedOn", {
                            date: getDateInLocale(
                                new Date(LS_KEYS.CURRENT_VERSION),
                                locale,
                            ),
                        })}{" "}
                        <span
                            onClick={() => setShowChangelog(true)}
                            className="text-accent underline underline-offset-2 cursor-pointer"
                        >
                            {t("changelog")}
                        </span>
                    </span>
                    <span className="hidden md:block">·</span>
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfiGd4FwosNnW2W8JdB8th0482LZMASbUnoNsAMPERxN7yZmw/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("feedbackLabel")}
                    </a>
                </div>
                <p className="mt-4 leading-relaxed">
                    {t("welcome", { series: t("series") })}
                </p>
            </div>

            {/* What is ENreco */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {t("whatIsTitle")}
                </span>
                <div className="border rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-muted-foreground">
                        {t.rich("whatIsIntro", {
                            shortName: t("shortName"),
                            bold: (chunks) => <strong>{chunks}</strong>,
                        })}
                    </p>
                    <blockquote className="italic leading-relaxed text-muted-foreground">
                        {t("officialDescription")}{" "}
                        <a
                            href="https://hololive.hololivepro.com/en/news/20240823-01-97/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="not-italic text-xs"
                        >
                            {t("source")}
                        </a>
                    </blockquote>
                    <p className="leading-relaxed">{t("explanation")}</p>
                </div>
            </div>

            {/* Notes + Guidelines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border rounded-xl p-4">
                    <p className="font-medium mb-2">{t("howToTitle")}</p>

                    <div>
                        {t.rich("howToContent", {
                            strong: (chunks) => <strong>{chunks}</strong>,
                        })}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                        {t("performanceNote")}
                    </div>
                </div>
                <div className="border rounded-xl p-4">
                    <p className="font-medium mb-2">{t("notesTitle")}</p>
                    <p className="mb-2">{t("notesContent")}</p>
                    <ul className="list-disc mt-4 text-muted-foreground">
                        <li>{t("watchStreams")}</li>
                        <li>{t("checkClips")}</li>
                    </ul>
                </div>
            </div>

            {/* Contact */}
            <div className="border rounded-xl px-4 py-3 text-sm">
                <p className="font-medium">{t("contactTitle")}</p>
                <div className="mt-2">
                    {t.rich("teamInfo", {
                        "twitter-link": (chunks) => (
                            <a
                                href="https://x.com/hiroavrs"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {chunks}
                            </a>
                        ),
                        "mail-link": (chunks) => (
                            <a href="mailto:your@email.com">{chunks}</a>
                        ),
                        email: t("email"),
                        twitter: t("twitterHandle"),
                    })}
                </div>
            </div>

            {/* Guidelines */}
            <div className="border rounded-xl p-4 text-sm">
                <p className="font-medium mb-2">{t("guidelinesTitle")}</p>
                <p className="leading-relaxed">
                    {t.rich("guidelinesContent", {
                        "minecraft-link": (chunks) => (
                            <a
                                href="https://www.minecraft.net/en-us/usage-guidelines"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {chunks}
                            </a>
                        ),
                        "cover-link": (chunks) => (
                            <a
                                href="https://hololivepro.com/en/terms/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {chunks}
                            </a>
                        ),
                        coverGuidelines: t("coverGuidelines"),
                        minecraftGuidelines: t("minecraftGuidelines"),
                    })}
                </p>
            </div>

            <ChangelogModal
                open={showChangelog}
                onClose={() => setShowChangelog(false)}
            />
        </div>
    );
};

export default InfoGeneral;
