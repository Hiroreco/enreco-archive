import TimestampHref from "@/components/view/content-components/TimestampHref";
import React from "react";

const ViewMemoryGameInfo = () => {
    return (
        <div className="flex flex-col gap-4">
            <p>
                <strong>
                    The Scarlet Wand{" "}
                    <img
                        className="inline h-6 w-6 mb-1"
                        src={"/images-opt/scarletwand.webp"}
                        alt={"scarletwand"}
                    />
                    's Memory Game
                </strong>{" "}
                was introduced on Day 7 of the journey. As its name suggests,
                its main purpose is to test the memory of our heroes.
            </p>
            <p>
                Upon starting the game, each round presents a white board where
                a number of squares light up in one of four colors—red, green,
                blue, or yellow. After about two seconds, the colors vanish, and
                the player must recreate the original pattern.
            </p>

            <p>
                If they get it right, their score increases, and the difficulty
                ramps up, presenting a more complex pattern. If they get it
                wrong, they lose points, and the difficulty decreases.
            </p>
            <p>
                The game continues until the 60-second timer runs out. Up to
                four players can compete at the same time, and whoever has the
                highest score at the end earns bragging rights.
            </p>
            <TimestampHref
                href="https://www.youtube.com/live/iAYrdIlfVf0?feature=shared&t=4271"
                caption="May the biggest brain win!"
                type="embed"
            />
        </div>
    );
};

export default ViewMemoryGameInfo;
