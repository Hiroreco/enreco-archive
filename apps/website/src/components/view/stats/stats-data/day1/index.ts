import type { DayData } from "../../types";
import { jobChoice } from "./job";
import { favoriteFood } from "./favorite_food";
import { pizzaChoice } from "./pizza";
import { petChoice } from "./pet";
import { opinionRestChoice } from "./opinion_rest";
import { BASE_TEAMS } from "../base-teams";

export const day1Data: DayData = {
  teams: BASE_TEAMS,
  continuous: [jobChoice, favoriteFood],
  choices: [pizzaChoice, petChoice, opinionRestChoice],
};
