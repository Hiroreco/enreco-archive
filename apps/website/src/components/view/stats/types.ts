export interface LocalizedString {
  en: string;
  ja: string;
}

export interface Talent {
  id: string;
  name: LocalizedString;
  color: string;
  image: string;
}


export interface ContinuousOption {
  label: LocalizedString;
  color: string;
  members: string[]; // talent IDs
}

export interface ContinuousChoice {
  id: string;
  title: LocalizedString;
  options: ContinuousOption[];
}

export type ChoiceType = "yesno" | "multi" | "opinion";

export interface ChoiceOption {
  label: LocalizedString;
  members: string[]; // talent IDs
}

export interface OpinionEntry {
  talent: string; // talent ID
  text: LocalizedString;
}

export interface Choice {
  id: string;
  question: LocalizedString;
  type: ChoiceType;
  /** For yesno / multi */
  options?: ChoiceOption[];
  /** For opinion */
  opinions?: OpinionEntry[];
}

export interface TeamData {
  name: LocalizedString;
  image?: string; // optional image src
  members: string[]; // talent IDs (de-duped on render)
}

export interface DayData {
  teams: TeamData[];
  continuous: ContinuousChoice[];
  choices: Choice[];
}

export type TrackerData = Record<number, DayData>;