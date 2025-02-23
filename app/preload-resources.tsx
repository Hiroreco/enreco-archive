"use client ";

import ReactDOM from "react-dom";

export default function PreloadResources() {
    ReactDOM.preload("/images-opt/card_deco.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/card_deco_dark.webp", {
        as: "image",
        fetchPriority: "high",
    });

    return null;
}
