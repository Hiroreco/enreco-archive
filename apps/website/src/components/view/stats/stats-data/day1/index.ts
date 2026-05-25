import { constantLieChoice } from "@/components/view/stats/stats-data/day1/constant-tl";
import { starSpeakersChoice } from "@/components/view/stats/stats-data/day1/star-speaker";
import type { DayData } from "../../types";
import { faustDealChoice } from "@/components/view/stats/stats-data/day1/faust-deal";

export const day1Data: DayData = {
    teams: [],
    continuous: [],
    choices: [starSpeakersChoice, faustDealChoice, constantLieChoice],
};
