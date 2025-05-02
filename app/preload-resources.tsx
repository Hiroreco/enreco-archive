"use client ";

import ReactDOM from "react-dom";

export default function PreloadResources() {
    ReactDOM.preload("/images-opt/card-deco.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/card-deco-dark.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-0.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-0-dark.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-1.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-1-dark.webp", {
        as: "image",
        fetchPriority: "high",
    });
    return null;
}
