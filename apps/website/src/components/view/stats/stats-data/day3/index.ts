import type { DayData } from "../../types";
import { overrideContinuous } from "../base-continuous";

const continuous = overrideContinuous({
    job: {
        0: { members: ["calli", "bae", "kronii"] },
        1: { members: ["ina", "shiori", "nerissa", "ame"] },
        2: { members: ["fauna", "irys"] },
        3: { members: ["gura", "bijou", "mumei"] },
        4: { members: ["kiara", "fuwawa", "mococo"] },
    },
    favorite_food: {
        0: { members: ["calli", "fauna", "shiori", "ame"] },
        1: { members: ["kiara", "irys", "mumei", "nerissa"] },
        2: { members: ["ina", "bijou"] },
        3: { members: ["gura", "bae", "kronii", "fuwawa", "mococo"] },
    },
});

export const day3Data: DayData = {
    teams: [],
    continuous,
    choices: [],
};
