import TimestampHref from "@/components/view/markdown/TimestampHref";
import React from "react";

const ViewChickenGameInfo = () => {
    return (
        <div className="flex flex-col gap-4">
            <p>
                Just like the Scarlet Wand, the Cerulean Cup{" "}
                <img
                    className="inline h-6 w-6 mb-1"
                    src={"/images-opt/ceruleancup.webp"}
                    alt={"ceruleancup"}
                />{" "}
                launched their own minigame on Day 7. As representatives of
                empathy, they designed a game that would help spread that very
                value: <strong>Catching Chickens</strong>.
            </p>
            <p>
                As the name suggests, the goal is simple—catch chickens… but
                empathetically. Players are presented with a board where
                chickens continuously spawn from the top and slowly fall
                downward. The objective? Move your basket horizontally along the
                bottom and catch as many falling chickens as possible within the
                time limit.
            </p>
            <p> That's it. Simple and fun.</p>
            <TimestampHref
                href="https://www.youtube.com/live/Rd0awHHBTiA?feature=shared&t=6328"
                caption="Spreading empathy through chickens"
                type="embed"
            />
        </div>
    );
};

export default ViewChickenGameInfo;
