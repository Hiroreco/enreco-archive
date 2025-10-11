import { useState } from "react";
import { Locale, useTranslations } from "next-intl";
import ViewChangelogModal from "@/components/view/basic-modals/ViewChangelog";
import { useSettingStore } from "@/store/settingStore";
import { LS_KEYS } from "@/lib/constants";

const getDateDifference = (
    date: Date = new Date("2025-06-10"),
    locale: Locale,
): string => {
    const now = new Date();
    const diffMonth =
        now.getMonth() -
        date.getMonth() +
        12 * (now.getFullYear() - date.getFullYear());
    const diffDays = now.getDate() - date.getDate();
    const diffMonths = Math.floor(diffMonth + (diffDays < 0 ? -1 : 0));
    const remainingDays =
        diffDays < 0
            ? new Date(now.getFullYear(), now.getMonth(), 0).getDate() +
              diffDays
            : diffDays;

    if (locale === "ja") {
        return `${Math.abs(diffMonths)}ヶ月${Math.abs(remainingDays)}日`;
    }
    // default to English
    return `${Math.abs(diffMonths)} month${Math.abs(diffMonths) !== 1 ? "s" : ""} ${Math.abs(remainingDays)} day${Math.abs(remainingDays) !== 1 ? "s" : ""}`;
};

const getDateInLocale = (date: Date, locale: Locale): string => {
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
};

const ViewInfoGeneral = () => {
    const t = useTranslations("modals.infoGeneral");
    const [showChangelog, setShowChangelog] = useState(false);
    const locale = useSettingStore((state) => state.locale);

    return (
        <div className="flex flex-col gap-4">
            <div className="mt-4 flex flex-col">
                <span className="font-bold text-3xl">{t("title")}</span>
                <span className="italic text-sm text-foreground/70 mr-4">
                    {t("updatedOn", {
                        date: getDateInLocale(
                            new Date(LS_KEYS.CURRENT_VERSION),
                            locale,
                        ),
                    })}{" "}
                    <span
                        onClick={() => {
                            setShowChangelog(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 underline cursor-pointer"
                    >
                        {t("changelog")}
                    </span>
                </span>
                <span className="italic text-sm text-foreground/70 mr-4">
                    {t("daysSinceLastEpisode")}{" "}
                    <span className="font-bold">
                        {getDateDifference(
                            new Date(
                                new Date("2025-05-11").toLocaleString("en-US", {
                                    timeZone: "Asia/Tokyo",
                                }),
                            ),
                            locale,
                        )}
                    </span>
                </span>
                <span className="italic text-sm text-foreground/70 mr-4">
                    {t("daysUntilNextChapter")}{" "}
                    <span className="font-bold">{t("noInfo")}</span>
                </span>

                <span className="italic text-sm text-foreground/70 mr-4">
                    {t("feedbackNote")}
                    {": "}
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfiGd4FwosNnW2W8JdB8th0482LZMASbUnoNsAMPERxN7yZmw/viewform?usp=dialog"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {t("feedbackLabel")}
                    </a>
                </span>
            </div>
            <div>{t("welcome", { series: t("series") })}</div>

            <div>{t("description")}</div>

            <div className="font-bold underline underline-offset-2 text-xl">
                {t("whatIsTitle")}
            </div>

            <div>
                {t.rich("whatIsIntro", {
                    shortName: t("shortName"),
                    bold: (chunks) => <strong>{chunks}</strong>,
                })}
            </div>
            <blockquote className="pl-4 italic opacity-80">
                {t("officialDescription")}{" "}
                <a
                    href="https://hololive.hololivepro.com/en/news/20240823-01-97/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("source")}
                </a>
            </blockquote>

            <div>{t("explanation")}</div>

            <div className="font-bold underline underline-offset-2 text-xl">
                {t("notesTitle")}
            </div>
            <div>
                {t("notesContent")}
                <ul className="list-disc mt-4">
                    <li>{t("watchStreams")}</li>
                    <li>
                        {t.rich("checkClips", {
                            "clipper-link": (chunks) => (
                                <a
                                    href="https://www.youtube.com/watch?v=KIbQ-tcNWDw&list=PLonYStlm50KZ_rKewRuHUfuEMYbk_hbsi&ab_channel=BoubonClipperCh."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {chunks}
                                </a>
                            ),
                            clipper: t("clipperName"),
                        })}
                    </li>
                </ul>
            </div>

            <div>
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

            <div>{t("nextSection")}</div>

            <div className="text-sm text-muted-foreground">
                {t("performanceNote")}
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                {t("guidelinesTitle")}
            </div>
            <div>
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
            </div>

            <ViewChangelogModal
                open={showChangelog}
                onClose={() => setShowChangelog(false)}
            />
        </div>
    );
};

export default ViewInfoGeneral;
