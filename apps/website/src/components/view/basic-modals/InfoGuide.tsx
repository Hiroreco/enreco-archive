import { BookOpen, CheckSquare, LibraryBig, Search } from "lucide-react";
import { useTranslations } from "next-intl";

const InfoGuide = () => {
    const t = useTranslations("modals.infoGuide");

    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">{t("title")}</span>

            <div>
                {t.rich("inspiration", {
                    link: (chunks) => (
                        <a
                            href="https://x.com/stemotology/status/1833171708775420066/photo/1"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {chunks}
                        </a>
                    ),
                })}
            </div>

            <div className="flex items-center gap-2">
                <Search size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    {t("generalTitle")}
                </div>
            </div>

            <div>{t("navigation")}</div>

            <div>{t("interaction")}</div>

            <div>
                {t("contentFormat")}
                <ul className="list-disc mt-4 ">
                    <li>
                        {t.rich("timestamps", {
                            bold: (chunks) => (
                                <span className="font-bold">{chunks}</span>
                            ),
                            timestamp: (chunks) => (
                                <span className="font-medium text-[#6594ba]">
                                    {chunks}
                                </span>
                            ),
                        })}
                    </li>
                    <li>
                        {t.rich("linkers", {
                            bold: (chunks) => (
                                <span className="font-bold">{chunks}</span>
                            ),
                            linker: (chunks) => (
                                <span className="text-red-700 dark:text-red-600 underline underline-offset-2 font-semibold">
                                    {chunks}
                                </span>
                            ),
                        })}
                    </li>
                    <li>
                        {t.rich("texts", {
                            bold: (chunks) => (
                                <span className="font-bold inline-flex items-center gap-1">
                                    {chunks}
                                </span>
                            ),
                            icon: () => <BookOpen size={18} />,
                        })}
                    </li>
                </ul>
            </div>

            <div>{t("fanworks")}</div>

            <div className="flex items-center gap-2">
                <CheckSquare size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    {t("readMarkersTitle")}
                </div>
            </div>

            <div>
                {t.rich("readMarkers", {
                    em: (chunks) => <em>{chunks}</em>,
                })}
            </div>

            <div className="flex items-center gap-2">
                <BookOpen size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    {t("readingOrderTitle")}
                </div>
            </div>

            <div>
                {t.rich("dayRecap", {
                    em: (chunks) => <em>{chunks}</em>,
                })}
            </div>

            <div>
                {t("recommendedOrder")}
                <div className="font-mono sm:text-base text-sm mt-2 text-center">
                    {t("orderSequence")}
                </div>
            </div>

            <div>{t("freeExploration")}</div>

            <div className="flex items-center gap-2">
                <LibraryBig size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    {t("otherFeaturesTitle")}
                </div>
            </div>
            <div>{t("otherFeatures")}</div>

            <div className="mt-4">{t("conclusion")}</div>
        </div>
    );
};

export default InfoGuide;
