import type { Choice } from "../../types";

export const maazNegotiationSoupChoice: Choice = {
    id: "maazNegotiationSoup",
    question: {
        en: "Maaz Negotiation Choice",
        ja: "マアズとの交渉時の選択",
    },
    type: "multi",
    options: [
        {
            label: {
                en: "Take the soup",
                ja: "スープを受け取る",
            },
            members: ["ina", "gigi"],
        },
        {
            label: {
                en: "Spill the soup",
                ja: "スープをこぼす",
            },
            members: ["kronii"],
        },
    ],
};
