import type { Choice } from "../../types";

export const blackMarketMethodChoice: Choice = {
    id: "blackMarketMethod",
    question: {
        en: "Black Market obtain method",
        ja: "ブラックマーケットでの入手方法",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "Pay 100 coins for the compass",
                ja: "100コインを支払ってコンパスを入手する",
            },
            members: [],
        },
        {
            label: {
                en: "Take without paying",
                ja: "支払わずに持ち去る",
            },
            members: ["bijou", "fuwawa", "raora", "bae", "mococo"],
        },
    ],
};
