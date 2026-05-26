import { starSpeakersChoice } from "@/components/view/stats/stats-data/day1/star-speaker";
import type { DayData } from "../../types";
import { faustDealChoice } from "@/components/view/stats/stats-data/day1/faust-deal";
import { opinionConstantSecretChoice } from "@/components/view/stats/stats-data/day1/constant-tl";

export const day1Data: DayData = {
    teams: [],
    continuous: [],
    choices: [starSpeakersChoice, faustDealChoice, opinionConstantSecretChoice],
};
