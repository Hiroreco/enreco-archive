const ViewInfoGuide = () => {
    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">
                How to Use ENreco Archive
            </span>

            <div>
                The concept for this site was inspired by the relationship
                charts created by{" "}
                <a href="https://x.com/stemotology" target="_blank">
                    stemotology
                </a>{" "}
                and{" "}
                <a href="https://x.com/sunkissedrhodo" target="_blank">
                    sunkissedrhodo
                </a>
                , but with an added interactive element. However, note that the
                charts here differ from the originals—they are designed to be
                concise and focus only on major relationships.
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                General
            </div>
            <div>
                You can navigate through each day and chapter using the controls
                at the bottom of the screen, and the chart will update
                accordingly.
            </div>
            <div>
                Clicking on a character or relationship will bring up a card
                containing information about them on that specific day.
            </div>

            <div>
                The content is written in a storytelling format and includes
                special links, which are color-coded for different actions:
                <ul className="list-disc mt-4 ">
                    <li>
                        <span className="font-bold">Timestamps:</span> Opens a{" "}
                        <span className="font-medium text-[#134ea0]">
                            timestamped{" "}
                        </span>
                        event in a card (or a new tab) for you to watch. It is
                        also used for fan-made content such as fanart, videos,
                        etc.
                    </li>
                    <li>
                        <span className="font-bold">Linkers:</span> Clicking on
                        a colored phrase like{" "}
                        <span className="text-red-700 underline underline-offset-2 font-semibold">
                            Raora-Tam: Say My Name
                        </span>{" "}
                        will directly open the referenced card.
                    </li>
                </ul>
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                Reading Order
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
                It's also encouraged to read from multiple POVs to catch details
                you might have missed and gain a deeper understanding of the
                relationships.
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                Settings
            </div>
            <div>
                You can customize various aspects of your experience in the{" "}
                <em>Settings Tab</em>, including music volume, timestamp
                preferences and other miscellaneous options.
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                Minigames
            </div>
            <div>
                A selection of minigames from the series has been recreated and
                can be played in the <em>Minigames Tab</em>—including the
                infamous Gambling Game from Chapter 1.
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                Easter Eggs
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
