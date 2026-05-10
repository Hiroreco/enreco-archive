import type { DayData } from "../../types";
import { BASE_TEAMS } from "../base-teams";
import { overrideContinuous } from "../base-continuous";

const continuous = overrideContinuous({
    job: {
        0: { members: ["bae", "kiara", "mumei"] },
        1: { members: ["ina", "shiori"] },
        2: { members: ["fauna", "irys", "bijou"] },
        3: { members: ["calli", "gura", "ame", "kronii"] },
        4: { members: ["nerissa", "fuwawa", "mococo"] },
    },
    favorite_food: {
        0: { members: ["ina", "kronii", "irys", "mumei"] },
        1: { members: ["calli", "kiara", "fauna"] },
        2: { members: ["gura", "shiori", "ame"] },
        3: { members: ["bae", "bijou", "nerissa", "fuwawa", "mococo"] },
    },
});

export const day7Data: DayData = {
    teams: BASE_TEAMS,
    continuous,
    choices: [],
};
