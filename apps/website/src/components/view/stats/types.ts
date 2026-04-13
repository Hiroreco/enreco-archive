export interface Talent {
  id: string;
  name: string;
  initials: string;
  color: string;
  /** Path relative to /public, e.g. "/talents/mori.png" */
  image: string;
}

// ---------------------------------------------------------------------------
// Continuous choices (can change per day, e.g. job classes)
// ---------------------------------------------------------------------------

export interface ContinuousOption {
  label: string;
  color: string;
  members: string[]; // talent IDs
}

export interface ContinuousChoice {
  id: string;
  title: string;
  options: ContinuousOption[];
}

// ---------------------------------------------------------------------------
// One-time choices
// ---------------------------------------------------------------------------

export type ChoiceType = "yesno" | "multi" | "opinion";

export interface ChoiceOption {
  label: string;
  members: string[]; // talent IDs
}

export interface OpinionEntry {
  talent: string; // talent ID
  text: string;
}

export interface Choice {
  id: string;
  question: string;
  type: ChoiceType;
  /** For yesno / multi */
  options?: ChoiceOption[];
  /** For opinion */
  opinions?: OpinionEntry[];
}

// ---------------------------------------------------------------------------
// Per-day data
// ---------------------------------------------------------------------------

export interface TeamData {
  name: string;
  members: string[]; // talent IDs (de-duped on render)
}

export interface DayData {
  teams: TeamData[];
  continuous: ContinuousChoice[];
  choices: Choice[];
}

export type TrackerData = Record<number, DayData>;