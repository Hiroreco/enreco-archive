import type { DayData, TeamData } from "../../types";
import { jobChoice } from "./job";
import { favoriteFood } from "./favorite_food";
import { pizzaChoice } from "./pizza";
import { petChoice } from "./pet";
import { opinionRestChoice } from "./opinion_rest";

const teams: TeamData[] = [
  { name: "Team A", members: ["calli", "gura", "fauna", "shiori"] },
  { name: "Team B", members: ["kiara", "ame", "kronii", "bijou"] },
  { name: "Team C", members: ["ina", "irys", "mumei", "nerissa"] },
  { name: "Team D", members: ["bae", "fuwawa", "mococo"] },
];

export const day1Data: DayData = {
  teams,
  continuous: [jobChoice, favoriteFood],
  choices: [pizzaChoice, petChoice, opinionRestChoice],
};
