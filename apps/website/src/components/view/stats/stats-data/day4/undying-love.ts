import type { Choice } from "../../types";

export const declareUndyingLoveChoice: Choice = {
    id: "declareUndyingLove",
    question: {
        en: "Would you approach a complete stranger and declare your undying love?",
        ja: "赤の他人に近づいて、永遠の愛を告白できますか？",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "No problem",
                ja: "問題ない",
            },
            members: ["nerissa", "bae", "shiori"],
        },
        {
            label: {
                en: "Never",
                ja: "絶対に無理",
            },
            members: ["fuwawa", "mococo", "bijou"],
        },
    ],
};
