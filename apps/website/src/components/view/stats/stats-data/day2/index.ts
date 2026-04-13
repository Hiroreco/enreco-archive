import type { DayData, TeamData } from "../../types";
import { jobChoice } from "./job";
import { favoriteFood } from "./favorite_food";
import { weaponChoice } from "./weapon";
import { justiceChoice } from "./justice";
import { fearChoice } from "./fear";

const teams: TeamData[] = [
  { name: "Team A", members: ["calli", "gura", "fauna", "shiori"] },
  { name: "Team B", members: ["kiara", "ame", "kronii", "bijou"] },
  { name: "Team C", members: ["ina", "irys", "mumei", "nerissa"] },
  { name: "Team D", members: ["bae", "fuwawa", "mococo"] },
];

export const day2Data: DayData = {
  teams,
  continuous: [jobChoice, favoriteFood],
  choices: [weaponChoice, justiceChoice, fearChoice],
};
