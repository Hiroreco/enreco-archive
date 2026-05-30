import type { Choice } from "../../types";

export const amuletOfLevitationMethodChoice: Choice = {
    id: "amuletOfLevitationMethod",
    question: {
        en: "Method to Obtain an Amulet of Levitation",
        ja: "浮遊のアミュレットの入手方法",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "Negotiate with Maaz",
                ja: "マアズと交渉する",
            },
            members: ["ina", "gigi", "cecilia", "calli", "kronii"],
        },
        {
            label: {
                en: "Steal the Amulet",
                ja: "アミュレットを盗む",
            },
            members: [
                "mococo",
                "shiori",
                "bijou",
                "nerissa",
                "bae",
                "raora",
                "liz",
                "fuwawa",
            ],
        },
    ],
};
