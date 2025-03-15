import {
    BookOpen,
    CheckSquare,
    Dice6,
    Egg,
    Search,
    Settings,
} from "lucide-react";

const ViewInfoGuide = () => {
    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">
                How to Use ENreco Archive
            </span>

            <div>
                The concept for this site was inspired by the relationship
                charts created by{" "}
                <a
                    href="https://x.com/stemotology/status/1833171708775420066/photo/1"
                    target="_blank"
                >
                    stemotology and sunkissedrhodo
                </a>
                , but with an added interactive element. However, note that the
                charts here differ from the originals.
            </div>

            <div className="flex items-center gap-2">
                <Search size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    General
                </div>
            </div>

            <div>
                You can navigate through each day and chapter using the controls
                at the bottom of the screen, and the chart will update
                accordingly.
            </div>

            <div>
                Clicking on a character or relationship will bring up a card
                containing information about them on that specific day. If a
                node or edge is dimmed, it means there were no updates on that
                day.
            </div>

            <div>
                The content is written in a storytelling format and includes
                special links, which are color-coded for different actions:
                <ul className="list-disc mt-4 ">
                    <li>
                        <span className="font-bold">Timestamps:</span> Opens a{" "}
                        <span className="font-medium text-[#6594ba]">
                            timestamp
                        </span>{" "}
                        (the corresponding section from the original stream
                        where the event took place) in a card for you to watch,
                        just look for the blue text (both small and big). It is
                        recommened to watch only the duration described by the
                        label to avoid spoilers.
                    </li>
                    <li>
                        <span className="font-bold">Linkers:</span> Clicking on
                        a colored segment like{" "}
                        <span className="text-red-700 dark:text-red-600 underline underline-offset-2 font-semibold">
                            Raora-Tam: Say My Name
                        </span>{" "}
                        will directly open the referenced card. This helps you
                        from needing to search for the card manually.
                    </li>
                </ul>
            </div>

            <div>
                You can also occasionally find links to fanworks such as art,
                music, or animation at the end of each card.
            </div>

            <div className="flex items-center gap-2">
                <CheckSquare size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    Read Markers
                </div>
            </div>

            <div>
                To help you keep track of your progress, there are read markers
                at the end of each card. To have an overall view of which cards
                you have read, click the counter at the top to open the{" "}
                <em>Read Status</em> tab.
            </div>

            <div className="flex items-center gap-2">
                <BookOpen size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    Reading Order
                </div>
            </div>

            <div>
                Each day also has its own <em>"Day Recap"</em>, which summarizes
                the events of that day. This opens automatically when you switch
                days, but you can also manually open it via the icon in the top
                right corner. From there, you can also toggle the visibility of
                relationships and characters.
            </div>

            <div>
                For a smooth reading experience, we recommend following this
                order:
                <div className="font-mono sm:text-base text-sm mt-2 text-center">
                    Day Recap → Character → Relationship
                </div>
            </div>

            <div>
                However, feel free to explore the cards in any order you like.
            </div>

            <div className="flex items-center gap-2">
                <Settings size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    Settings
                </div>
            </div>

            <div>
                You can customize various aspects of your experience in the{" "}
                <em>Settings Tab</em>, including music volume, timestamp
                preferences and other miscellaneous options.
            </div>

            <div className="flex items-center gap-2">
                <Dice6 size={24} />
                <div className="font-bold underline underline-offset-2 text-xl">
                    Minigames
                </div>
            </div>
            <div>
                A selection of minigames from the series has been recreated and
                can be played in the <em>Minigames Tab</em>—including the
                infamous Gambling Game from Chapter 1.
            </div>

            <div className="flex items-center gap-2">
                <Egg size={24} />

                <div className="font-bold underline underline-offset-2 text-xl">
                    Easter Eggs
                </div>
            </div>
            <div>
                Hidden throughout the cards are easter eggs—little nods to silly
                moments or tributes to certain members. These are interactive,
                so keep an eye out for surprises!
            </div>

            <div className="mt-4">
                That's about it! We hope you enjoy your stay on this enigmatic
                journey!
            </div>
        </div>
    );
};

export default ViewInfoGuide;
