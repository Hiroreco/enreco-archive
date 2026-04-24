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
                    Main Features
                </div>
                <div className="mt-4">
                    These are the main features for content related things about
                    the event. Use these features to catch up on the story,
                    check what you've missed, or simply relive the events
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InfoGuideCard
                        title={t("chartTitle")}
                        description="Navigation, interaction, and content formats"
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
                                                Nerissa kisses Elizabeth
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
                                                Raora-Tam
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
                                                <span>Shiori's Journal</span>
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
                        description="Track your reading progress"
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
                        title={"Glossary"}
                        description="Summaries of characters, storylines and more."
                        icon={<LibraryBig size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                <div>
                                    The Glossary Tab, represented by the library
                                    icon on the top left, serves as a
                                    comprehensive reference for all characters,
                                    storylines, and important terms related to
                                    the event.
                                </div>

                                <div>
                                    It provides detailed summaries and
                                    descriptions, allowing you to quickly look
                                    up information about specific characters or
                                    storylines without having to search through
                                    the entire content.
                                </div>
                            </div>
                        }
                    />

                    <InfoGuideCard
                        title={"Chapter Recap"}
                        description="Read the key events of each chapter"
                        icon={<Book size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                The Chapter Recap Tab, which can be found on the
                                right side with the book icon, provides concise
                                summaries of each chapter's key events. This
                                feature is designed to help you quickly catch up
                                on the story or refresh your memory about
                                specific chapters without having to reread
                                everything.
                            </div>
                        }
                    />
                </div>
            </div>

            <div>
                <div className="font-bold text-2xl underline underline-offset-2 mt-4">
                    Other Features
                </div>
                <div className="mt-4">
                    These features help with the overall experience of using the
                    site. You can listen to music used in the event, checkout
                    hundreds of fanart made ny the community, watch clips, news,
                    and more!
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InfoGuideCard
                        title={"Jukebox"}
                        description="Listen to music used in the event"
                        icon={<Disc3 size={20} />}
                        content={
                            <div>
                                Want to be more immersive in exploring the
                                content? The Jukebox Tab, represented by the
                                music disc icon, allows you to listen to the
                                music used in the event. Whether it's background
                                music, character themes, or iconic tracks, you
                                can enjoy them all in one place while navigating
                                through the content. It's a great way to enhance
                                your experience and connect more deeply with the
                                story and its atmosphere.
                            </div>
                        }
                    />
                    <InfoGuideCard
                        title={"Libestal Gallery"}
                        description="View fanart made by the community"
                        icon={<Palette size={20} />}
                        content={
                            <div>
                                The most amazing thing about ENreco is the
                                community that has formed around it. The
                                Libestal Gallery Tab, represented by the art
                                palette icon, is a dedicated space to showcase
                                the incredible fanart created by the community.
                                Here, you can browse through hundreds of fanart
                                pieces inspired by the event, created by
                                talented artists who share their love for the
                                story and characters.
                            </div>
                        }
                    />
                    <InfoGuideCard
                        title={"News"}
                        description="Latest official news about ENreco"
                        icon={<Newspaper size={20} />}
                        content={
                            <div>
                                Stay updated with the latest official news about
                                ENreco through the News Tab, which is
                                represented by the news icon. This section
                                provides you with the most recent announcements,
                                updates, and important information related to
                                the event.
                            </div>
                        }
                    />
                    <InfoGuideCard
                        title={"Media Archive"}
                        description="Watch clips, trailers, and more"
                        icon={<Film size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                <div>
                                    The Media Archive Tab, represented by the
                                    video icon on the top left, is a treasure
                                    trove of both fan made clips as well as
                                    official trailers, and other media related
                                    to the event.
                                </div>
                                <div>
                                    Not only that, you can also read every
                                    single written book that was found in the
                                    event, from journal entries made by the
                                    talents to official lore books. And, more
                                    importantly, you can also read fanfics
                                    written by the community!
                                </div>
                            </div>
                        }
                    />
                    <InfoGuideCard
                        title={"Bingo!"}
                        description="Make your own ENreco-themed bingo card"
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
                                <div>
                                    So many unexpected things happen in this
                                    story, so why not turn it into a game? You
                                    can now create your own ENreco-themed bingo
                                    card in the **Bingo tab.**
                                </div>
                                <div>
                                    Write your predictions, mark off events as
                                    they happen, make a new card each day, or
                                    use the preset options we’ve prepared. You
                                    can also export and share your card with
                                    friends or on social media.
                                </div>
                            </div>
                        }
                    />
                    <InfoGuideCard
                        title={"Settings"}
                        description="Customize your experience and preferences"
                        icon={<Settings size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                <div>
                                    Last but not least, the Settings Tab,
                                    represented by the gear icon, allows you to
                                    customize your experience and preferences on
                                    the site.
                                </div>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default InfoGuide;
