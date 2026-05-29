import type { Choice } from "../../types";

export const throwAwayPossessionsChoice: Choice = {
    id: "throwAwayPossessions",
    question: {
        en: "Could you throw away all your money and possessions, forever?",
        ja: "お金や所持品をすべて、永遠に捨てることができますか？",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "In a heartbeat",
                ja: "迷わず捨てる",
            },
            members: ["fuwawa", "bijou"],
        },
        {
            label: {
                en: "Absolutely not",
                ja: "絶対無理",
            },
            members: ["mococo", "nerissa", "bae", "shiori"],
        },
    ],
};
