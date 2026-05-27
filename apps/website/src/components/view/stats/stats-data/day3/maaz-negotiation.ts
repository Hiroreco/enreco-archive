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
                en: "Leave the soup",
                ja: "スープをそのままにする",
            },
            members: ["ina"],
        },
        {
            label: {
                en: "Spill the soup",
                ja: "スープをこぼす",
            },
            members: [],
        },
    ],
};
