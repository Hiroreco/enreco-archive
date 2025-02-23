"use client ";

import ReactDOM from "react-dom";

export default function PreloadResources() {
    ReactDOM.preload("/card_deco_temp.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/card_deco_temp_dark.webp", {
        as: "image",
        fetchPriority: "high",
    });

    return null;
}
