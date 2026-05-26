import type { Choice } from "../../types";

export const glassCompassObtainMethodChoice: Choice = {
    id: "glassCompassObtainMethodChoice",
    question: {
        en: "Method to Obtain Glass Compass",
        ja: "ガラスのコンパスの入手方法",
    },
    type: "multi",
    options: [
        {
            label: { en: "Hamal", ja: "ハマル" },
            members: [
                "nerissa",
                "shiori",
                "liz",
                "gigi",
                "cecilia",
                "kronii",
                "ina",
            ],
        },
        {
            label: { en: "Black Market", ja: "ブラックマーケット" },
            members: ["bijou", "fuwawa", "raora", "bae"],
        },
    ],
};
