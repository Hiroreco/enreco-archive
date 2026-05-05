import type { DayData } from "../../types";
import { weaponChoice } from "./weapon";
import { justiceChoice } from "./justice";
import { fearChoice } from "./fear";
import { BASE_TEAMS, overrideTeams } from "../base-teams";
import { overrideContinuous } from "../base-continuous";

const teams = overrideTeams({
  0: { members: ["calli", "gura", "fauna", "shiori", "nerissa"] },
  1: { members: ["kiara", "ame", "fuwawa", "mococo"] },
  2: { members: ["ina", "irys", "mumei"] },
  3: { members: ["bae", "kronii", "bijou"] },
});

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
  teams,
  continuous,
  choices: [weaponChoice, justiceChoice, fearChoice],
};
