import {
    Book,
    BookOpen,
    CheckSquare,
    Disc3,
    Film,
    LibraryBig,
    Newspaper,
    Palette,
    Settings,
    Workflow,
} from "lucide-react";
import { useTranslations } from "next-intl";
import InfoGuideCard from "./InfoGuideCard";
import Image from "next/image";

const InfoGuide = () => {
    const t = useTranslations("modals.infoGuide");

    return (
        <div className="flex flex-col gap-6">
            {/* General Features Cards */}
            <div>
                <div className="font-bold text-2xl underline underline-offset-2 mt-4">
                    {t("mainTitle")}
                </div>
                <div className="mt-4">{t("mainDescription")}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InfoGuideCard
                        title={t("chartTitle")}
                        description={t("chartDescription")}
                        icon={<Workflow size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                {/* Navigation & interaction */}
                                <div>{t("navigation")}</div>
                                <div>{t("interaction")}</div>

                                {/* Link type legend */}
                                <div>
                                    <div className="mb-3">
                                        {t("contentFormat")}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-2 rounded-md border border-border/40 px-3 py-2">
                                            <span className="font-medium text-[#6594ba] shrink-0 text-sm">
                                                {t("timestampsExample")}
                                            </span>
                                            <div className="text-sm">
                                                <span className="font-semibold">
                                                    {t("timestampsLabel")}{" "}
                                                </span>
                                                {t("timestamps")}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 rounded-md border border-border/40 px-3 py-2">
                                            <span className="text-pink-400 underline underline-offset-2 font-semibold shrink-0 text-sm">
                                                {t("linkersExample")}
                                            </span>
                                            <div className="text-sm">
                                                <span className="font-semibold">
                                                    {t("linkersLabel")}{" "}
                                                </span>
                                                {t("linkers")}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 rounded-md border border-border/40 px-3 py-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <BookOpen
                                                    size={16}
                                                    className=""
                                                />
                                                <span>{t("textsExample")}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-semibold">
                                                    {t("textsLabel")}{" "}
                                                </span>
                                                {t("texts")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reading order */}
                                <div>
                                    {t.rich("dayRecap", {
                                        em: (chunks) => <em>{chunks}</em>,
                                    })}
                                </div>
                                <div>
                                    <div>{t("recommendedOrder")}</div>
                                    <div className="font-mono text-sm mt-2 text-center">
                                        {t("orderSequence")}
                                    </div>
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {t("freeExploration")}
                                </div>
                            </div>
                        }
                    />

                    <InfoGuideCard
                        title={t("readMarkersTitle")}
                        description={t("readMarkersDescription")}
                        icon={<CheckSquare size={20} />}
                        content={
                            <div>
                                {t.rich("readMarkers", {
                                    em: (chunks) => <em>{chunks}</em>,
                                })}
                            </div>
                        }
                    />

                    <InfoGuideCard
                        title={t("glossaryTitle")}
                        description={t("glossaryDescription")}
                        icon={<LibraryBig size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                <div>{t("glossaryText1")}</div>

                                <div>{t("glossaryText2")}</div>
                            </div>
                        }
                    />

                    <InfoGuideCard
                        title={t("chapterRecapTitle")}
                        description={t("chapterRecapDescription")}
                        icon={<Book size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                {t("chapterRecapContent")}
                            </div>
                        }
                    />
                </div>
            </div>

            <div>
                <div className="font-bold text-2xl underline underline-offset-2 mt-4">
                    {t("otherFeaturesTitle")}
                </div>
                <div className="mt-4">{t("otherFeaturesDescription")}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InfoGuideCard
                        title={t("jukeboxTitle")}
                        description={t("jukeboxDescription")}
                        icon={<Disc3 size={20} />}
                        content={<div>{t("jukeboxContent")}</div>}
                    />
                    <InfoGuideCard
                        title={t("libestalGalleryTitle")}
                        description={t("libestalGalleryDescription")}
                        icon={<Palette size={20} />}
                        content={<div>{t("libestalGalleryContent")}</div>}
                    />
                    <InfoGuideCard
                        title={t("newsTitle")}
                        description={t("newsDescription")}
                        icon={<Newspaper size={20} />}
                        content={<div>{t("newsContent")}</div>}
                    />
                    <InfoGuideCard
                        title={t("mediaArchiveTitle")}
                        description={t("mediaArchiveDescription")}
                        icon={<Film size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                <div>{t("mediaArchiveContent1")}</div>
                                <div>{t("mediaArchiveContent2")}</div>
                            </div>
                        }
                    />
                    <InfoGuideCard
                        title={t("bingoTitle")}
                        description={t("bingoDescription")}
                        icon={
                            <Image
                                src={"/images-opt/bingo-logo-opt.webp"}
                                alt="bingo icon"
                                width={20}
                                height={20}
                            />
                        }
                        content={
                            <div className="flex flex-col gap-4">
                                <div>{t("bingoContent1")}</div>
                                <div>{t("bingoContent2")}</div>
                            </div>
                        }
                    />
                    <InfoGuideCard
                        title={t("settingsTitle")}
                        description={t("settingsDescription")}
                        icon={<Settings size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                <div>{t("settingsContent1")}</div>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default InfoGuide;
