import TimestampHref from "@/components/view/content-components/TimestampHref";
import React from "react";

const ViewGamblingGameInfo = () => {
    return (
        <div className="flex flex-col gap-4">
            <p>
                The most frequently visited minigame—or rather, venue—of Chapter
                One was undoubtedly the <strong>Amber Coin Casino</strong>{" "}
                <img
                    className="inline h-6 w-6 mb-1"
                    src={"/images-opt/ambercoin.webp"}
                    alt={"ambercoin"}
                />
                , where everyone could indulge in their favorite pastime:
                gambling.
            </p>
            <p>
                The casino's signature minigame functions like a roulette of
                sorts. A board displays four different colors, each occupying a
                set number of squares with a corresponding multiplier:
            </p>
            <ul>
                <li>
                    <span className="text-blue-600">Blue:</span> 12 squares, 2x
                    multiplier
                </li>
                <li>
                    <span className="text-green-600">Green:</span> 8 squares, 3x
                    multiplier
                </li>
                <li>
                    <span className="text-yellow-600">Yellow:</span> 4 squares,
                    5x multiplier
                </li>
                <li>
                    <span className="text-red-600">Red:</span> 1 square, 10x
                    multiplier
                </li>
            </ul>
            <p>
                Players can choose how much to bet on each color. Once the game
                begins, colors are eliminated one by one, slowly whittling down
                the board—until only one remained.
            </p>
            <p>
                Whoever bets on the final color would receive their wager
                multiplied accordingly.
            </p>
            <TimestampHref
                href="https://www.youtube.com/live/PJtapc2_7ok?feature=shared&t=11173"
                caption="Let's go gambling!"
                type="embed"
            />
        </div>
    );
};

export default ViewGamblingGameInfo;
