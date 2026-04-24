import {
    Book,
    BookOpen,
    CheckSquare,
    Disc3,
    Film,
    LibraryBig,
    Newspaper,
    Palette,
} from "lucide-react";
import { useTranslations } from "next-intl";
import InfoGuideCard from "./InfoGuideCard";

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
                        title={t("generalTitle")}
                        description="Navigation, interaction, and content formats"
                        icon={<LibraryBig size={20} />}
                        content={
                            <div className="flex flex-col gap-4">
                                <div>{t("navigation")}</div>
                                <div>{t("interaction")}</div>
                                <div>
                                    {t("contentFormat")}
                                    <ul className="list-disc mt-4 ml-5">
                                        <li>
                                            {t.rich("timestamps", {
                                                bold: (chunks) => (
                                                    <span className="font-bold">
                                                        {chunks}
                                                    </span>
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
                                                    <span className="font-bold">
                                                        {chunks}
                                                    </span>
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
                                                icon: () => (
                                                    <BookOpen size={18} />
                                                ),
                                            })}
                                        </li>
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-4">
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
                </div>
            </div>
        </div>
    );
};

export default InfoGuide;
