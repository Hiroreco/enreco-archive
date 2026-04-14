import type { DayData } from "../../types";
import { jobChoice } from "./job";
import { favoriteFood } from "./favorite_food";
import { weaponChoice } from "./weapon";
import { justiceChoice } from "./justice";
import { fearChoice } from "./fear";
import { BASE_TEAMS, overrideTeams } from "../base-teams";

const teams = overrideTeams({
  0: { members: ["calli", "gura", "fauna", "shiori", "nerissa"] }, // Team A added nerissa
  1: { members: ["kiara", "ame", "fuwawa", "mococo"] }, // Team B rearranged
  2: { members: ["ina", "irys", "mumei"] }, // Team C changed
  3: { members: ["bae", "kronii", "bijou"] }, // Team D changed
});

export const day2Data: DayData = {
  teams,
  continuous: [jobChoice, favoriteFood],
  choices: [weaponChoice, justiceChoice, fearChoice],
};
