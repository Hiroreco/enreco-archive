import type { DayData } from "../../types";
import { BASE_TEAMS } from "../base-teams";
import { overrideContinuous } from "../base-continuous";

const continuous = overrideContinuous({
    job: {
        0: { members: ["kiara", "ina", "bae", "bijou"] },
        1: { members: ["kronii", "nerissa"] },
        2: { members: ["fauna", "irys", "mumei"] },
        3: { members: ["calli", "gura", "shiori"] },
        4: { members: ["ame", "fuwawa", "mococo"] },
    },
    favorite_food: {
        0: { members: ["calli", "kiara", "fauna", "bijou"] },
        1: { members: ["gura", "irys", "mumei"] },
        2: { members: ["ina", "kronii", "shiori"] },
        3: { members: ["ame", "nerissa", "bae", "fuwawa", "mococo"] },
    },
});

export const day8Data: DayData = {
    teams: BASE_TEAMS,
    continuous,
    choices: [],
};
