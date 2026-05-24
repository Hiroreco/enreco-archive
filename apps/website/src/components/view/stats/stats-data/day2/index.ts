import type { DayData } from "../../types";
import { overrideContinuous } from "../base-continuous";
import { fearChoice } from "./fear";
import { justiceChoice } from "./justice";
import { weaponChoice } from "./weapon";

const continuous = overrideContinuous({
    job: {
        0: { members: ["calli", "kiara", "bae", "ame"] },
        1: { members: ["ina", "kronii", "shiori"] },
        2: { members: ["fauna", "irys", "mumei"] },
        3: { members: ["gura", "bijou"] },
        4: { members: ["nerissa", "fuwawa", "mococo"] },
    },
    favorite_food: {
        0: { members: ["calli", "fauna", "shiori", "ame"] },
        1: { members: ["kiara", "irys", "mumei", "nerissa"] },
        2: { members: ["ina", "bijou"] },
        3: { members: ["gura", "bae", "kronii", "fuwawa", "mococo"] },
    },
});

export const day2Data: DayData = {
    continuous,
    choices: [weaponChoice, justiceChoice, fearChoice],
};
