import type { TeamData } from "../types";

/**
 * Base team data shared across days.
 * Override specific teams in individual day files as needed.
 */
export const BASE_TEAMS: TeamData[] = [
  {
    name: { en: "Team A", ja: "チームA" },
    image: "images-opt/scarletwand-opt.webp",
    members: ["calli", "gura", "fauna", "shiori"],
  },
  {
    name: { en: "Team B", ja: "チームB" },
    image: "images-opt/ceruleancup-opt.webp",
    members: ["kiara", "ame", "kronii", "bijou"],
  },
  {
    name: { en: "Team C", ja: "チームC" },
    image: "images-opt/ambercoin-opt.webp",
    members: ["ina", "irys", "mumei", "nerissa"],
  },
  {
    name: { en: "Team D", ja: "チームD" },
    image: "images-opt/jadesword-opt.webp",
    members: ["bae", "fuwawa", "mococo"],
  },
];

/**
 * Merge base teams with day-specific overrides.
 * @param overrides Object keyed by team index with partial TeamData to override
 * @example
 * const teams = overrideTeams({
 *   0: { members: ["calli", "gura", "fauna", "shiori", "nerissa"] }, // only override members of team 0
 * });
 */
export function overrideTeams(
  overrides?: Partial<Record<number, Partial<TeamData>>>,
): TeamData[] {
  if (!overrides) return BASE_TEAMS;

  return BASE_TEAMS.map((team, i) => ({
    ...team,
    ...(overrides[i] || {}),
  }));
}
