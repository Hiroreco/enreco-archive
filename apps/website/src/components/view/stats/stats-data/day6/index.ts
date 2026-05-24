import type { DayData } from "../../types";
import { overrideContinuous } from "../base-continuous";

const continuous = overrideContinuous({
    job: {
        0: { members: ["calli", "ina", "bae"] },
        1: { members: ["kronii", "ame", "nerissa"] },
        2: { members: ["fauna", "irys", "bijou", "mumei"] },
        3: { members: ["gura", "shiori"] },
        4: { members: ["kiara", "fuwawa", "mococo"] },
    },
    favorite_food: {
        0: { members: ["calli", "ina", "fauna", "mumei"] },
        1: { members: ["kiara", "gura", "irys"] },
        2: { members: ["kronii", "shiori", "ame", "bijou"] },
        3: { members: ["nerissa", "bae", "fuwawa", "mococo"] },
    },
});

export const day6Data: DayData = {
    continuous,
    choices: [],
};
