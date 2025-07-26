"use client ";

import ReactDOM from "react-dom";

export default function PreloadResources() {
    ReactDOM.preload("/images-opt/card-deco-opt.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/card-deco-dark-opt.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-0-opt.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-0-dark-opt.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-1-opt.webp", {
        as: "image",
        fetchPriority: "high",
    });
    ReactDOM.preload("/images-opt/bg-1-dark-opt.webp", {
        as: "image",
        fetchPriority: "high",
    });
    return null;
}
