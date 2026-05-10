import type { DayData } from "../../types";
import { BASE_TEAMS } from "../base-teams";
import { overrideContinuous } from "../base-continuous";

const continuous = overrideContinuous({
    job: {
        0: { members: ["kiara", "bae", "mumei"] },
        1: { members: ["ina", "shiori"] },
        2: { members: ["fauna", "irys", "bijou"] },
        3: { members: ["calli", "gura", "ame", "kronii"] },
        4: { members: ["nerissa", "fuwawa", "mococo"] },
    },
    favorite_food: {
        0: { members: ["fauna", "kronii", "shiori", "bijou"] },
        1: { members: ["kiara", "ina", "irys"] },
        2: { members: ["calli", "ame", "mumei"] },
        3: { members: ["gura", "nerissa", "bae", "fuwawa", "mococo"] },
    },
});

export const day5Data: DayData = {
    teams: BASE_TEAMS,
    continuous,
    choices: [],
};
