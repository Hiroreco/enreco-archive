import type { DayData } from "../../types";
import { BASE_TEAMS } from "../base-teams";
import { overrideContinuous } from "../base-continuous";

const continuous = overrideContinuous({
    job: {
        0: { members: ["calli", "kiara", "ina"] },
        1: { members: ["kronii", "nerissa", "ame"] },
        2: { members: ["fauna", "irys", "mumei", "bijou"] },
        3: { members: ["gura", "shiori"] },
        4: { members: ["bae", "fuwawa", "mococo"] },
    },
    favorite_food: {
        0: { members: ["calli", "ina", "kronii"] },
        1: { members: ["kiara", "gura", "irys", "mumei", "shiori"] },
        2: { members: ["ame", "bijou", "nerissa"] },
        3: { members: ["fauna", "bae", "fuwawa", "mococo"] },
    },
});

export const day4Data: DayData = {
    teams: BASE_TEAMS,
    continuous,
    choices: [],
};
