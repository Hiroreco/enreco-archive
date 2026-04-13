import type { Talent, TrackerData } from "./types";

// ---------------------------------------------------------------------------
// Talent roster
// Update `image` paths to match your /public folder structure.
// ---------------------------------------------------------------------------

export const TALENTS: Talent[] = [
  { id: "mori",    name: "Mori Calliope",       initials: "MC",  color: "#E24B4A", image: "/images-opt/node-calli-opt.webp" },
  { id: "kiara",   name: "Takanashi Kiara",      initials: "TK",  color: "#EF9F27", image: "/images-opt/node-kiara-opt.webp" },
  { id: "ina",     name: "Ninomae Ina'nis",      initials: "NI",  color: "#7F77DD", image: "/images-opt/node-ina-opt.webp" },
  { id: "gura",    name: "Gawr Gura",            initials: "GG",  color: "#378ADD", image: "/images-opt/node-gura-opt.webp" },
  { id: "ame",     name: "Watson Amelia",         initials: "WA",  color: "#FAC775", image: "/images-opt/node-ame-opt.webp" },
  { id: "irys",    name: "IRyS",                 initials: "IR",  color: "#D4537E", image: "/images-opt/node-irys-opt.webp" },
  { id: "fauna",   name: "Ceres Fauna",           initials: "CF",  color: "#639922", image: "/images-opt/node-fauna-opt.webp" },
  { id: "kronii",  name: "Ouro Kronii",           initials: "OK",  color: "#185FA5", image: "/images-opt/node-kronii-opt.webp" },
  { id: "mumei",   name: "Nanashi Mumei",         initials: "NM",  color: "#BA7517", image: "/images-opt/node-mumei-opt.webp" },
  { id: "bae",     name: "Hakos Baelz",           initials: "HB",  color: "#A32D2D", image: "/images-opt/node-bae-opt.webp" },
  { id: "shiori",  name: "Shiori Novella",        initials: "SN",  color: "#9FE1CB", image: "/images-opt/node-shiori-opt.webp" },
  { id: "bijou",   name: "Koseki Bijou",          initials: "KB",  color: "#5DCAA5", image: "/images-opt/node-bijou-opt.webp" },
  { id: "nerissa", name: "Nerissa Ravencroft",    initials: "NR",  color: "#CBA8F0", image: "/images-opt/node-nerissa-opt.webp" },
  { id: "fuwawa",  name: "Fuwawa Abyssgard",      initials: "FW",  color: "#F4C0D1", image: "/images-opt/node-fuwawa-opt.webp" },
  { id: "mococo",  name: "Mococo Abyssgard",      initials: "MC2", color: "#F0997B", image: "/images-opt/node-mococo-opt.webp" },
];

export const talentById = (id: string): Talent | undefined =>
  TALENTS.find((t) => t.id === id);

// ---------------------------------------------------------------------------
// Tracker data — fill in real data per day.
// Day keys are 1-indexed integers.
// ---------------------------------------------------------------------------

export const TRACKER_DATA: TrackerData = {
  1: {
    teams: [
      { name: "Team A", members: ["mori", "gura", "fauna", "shiori"] },
      { name: "Team B", members: ["kiara", "ame", "kronii", "bijou"] },
      { name: "Team C", members: ["ina", "irys", "mumei", "nerissa"] },
      { name: "Team D", members: ["bae", "fuwawa", "mococo"] },
    ],
    continuous: [
      {
        id: "job",
        title: "Job class",
        options: [
          { label: "Warrior", color: "#E24B4A", members: ["mori", "kiara", "bae"] },
          { label: "Mage",    color: "#7F77DD", members: ["ina", "kronii", "shiori"] },
          { label: "Healer",  color: "#1D9E75", members: ["fauna", "irys", "mumei"] },
          { label: "Rogue",   color: "#BA7517", members: ["gura", "ame", "bijou"] },
          { label: "Bard",    color: "#D4537E", members: ["nerissa", "fuwawa", "mococo"] },
        ],
      },
      {
        id: "favorite_food",
        title: "Favorite food",
        options: [
            {label: "Potato Sald", color: "#E5A663", members: ["mori", "ina", "fauna", "kronii", "shiori"] },
            {label: "Stain Milkshake",   color: "#639922", members: ["kiara", "gura", "irys", "mumei"] },
            {label: "Milkshake",       color: "#185FA5", members: ["ame", "bijou", "nerissa"] },
            {label: "Pizza on Pineapple",       color: "#BA7517", members: ["bae", "fuwawa", "mococo"] },
        ],
      }
    ],
    choices: [
      {
        id: "pizza",
        question: "Do you find pineapple on pizza acceptable?",
        type: "yesno",
        options: [
          { label: "Yes", members: ["kiara", "ame", "bae", "fuwawa"] },
          { label: "No",  members: ["mori", "ina", "gura", "fauna", "kronii", "mumei", "irys", "bijou", "nerissa", "mococo", "shiori"] },
        ],
      },
      {
        id: "pet",
        question: "What pet would you choose as a companion?",
        type: "multi",
        options: [
          { label: "Cat",  members: ["ina", "fauna", "kronii", "shiori"] },
          { label: "Dog",  members: ["kiara", "gura", "ame", "bae", "fuwawa", "mococo"] },
          { label: "Bird", members: ["mori", "irys", "nerissa"] },
          { label: "Fish", members: ["bijou", "mumei"] },
        ],
      },
      {
        id: "opinion_rest",
        question: "What would be your ideal rest day?",
        type: "opinion",
        opinions: [
          { talent: "mori",    text: "Sleep until 4pm, then make beats alone in the dark." },
          { talent: "kiara",   text: "Cook a huge meal and watch trashy TV." },
          { talent: "ina",     text: "Lie in bed and draw for 12 hours straight." },
          { talent: "gura",    text: "Gaming marathon, no responsibilities whatsoever." },
          { talent: "ame",     text: "Tinker with gadgets, lose track of time." },
          { talent: "irys",    text: "Karaoke by myself and eat good food." },
          { talent: "fauna",   text: "Forest walk, no schedule, no obligations." },
          { talent: "kronii",  text: "Complete silence. Maybe read." },
          { talent: "mumei",   text: "I'd probably forget it was a rest day and do stuff anyway." },
          { talent: "bae",     text: "Chaos. Whatever feels like chaos." },
          { talent: "shiori",  text: "Read a very long book with lots of tea." },
          { talent: "bijou",   text: "Rock collecting in the mountains, obviously." },
          { talent: "nerissa", text: "Practice singing and eat pasta." },
          { talent: "fuwawa",  text: "Cuddle Mococo and watch movies." },
          { talent: "mococo",  text: "Cuddle Fuwawa and watch movies." },
        ],
      },
    ],
  },
  2: {
    teams: [
      { name: "Team A", members: ["mori", "gura", "fauna", "shiori"] },
      { name: "Team B", members: ["kiara", "ame", "kronii", "bijou"] },
      { name: "Team C", members: ["ina", "irys", "mumei", "nerissa"] },
      { name: "Team D", members: ["bae", "fuwawa", "mococo"] },
    ],
    continuous: [
      {
        id: "job",
        title: "Job class",
        options: [
          { label: "Warrior", color: "#E24B4A", members: ["mori", "kiara", "bae", "ame"] },
          { label: "Mage",    color: "#7F77DD", members: ["ina", "kronii", "shiori"] },
          { label: "Healer",  color: "#1D9E75", members: ["fauna", "irys", "mumei"] },
          { label: "Rogue",   color: "#BA7517", members: ["gura", "bijou"] },
          { label: "Bard",    color: "#D4537E", members: ["nerissa", "fuwawa", "mococo"] },
        ],
        
      },
        {
        id: "favorite_food",
        title: "Favorite food",
       options: [
            {label: "Potato Sald", color: "#E5A663", members: ["mori", "ina", "fauna", ] },
            {label: "Stain Milkshake",   color: "#639922", members: ["kiara", "gura", "irys", "mumei", "mococo"] },
            {label: "Milkshake",       color: "#185FA5", members: ["ame", "bijou", "nerissa", "kronii", "shiori"] },
            {label: "Pizza on Pineapple",       color: "#BA7517", members: ["bae", "fuwawa", ] },
        ],
        }
    ],
    choices: [
      {
        id: "weapon",
        question: "Which weapon would you wield in battle?",
        type: "multi",
        options: [
          { label: "Sword",  members: ["mori", "kiara", "kronii", "bae"] },
          { label: "Staff",  members: ["ina", "fauna", "shiori"] },
          { label: "Bow",    members: ["gura", "mumei", "bijou"] },
          { label: "Dagger", members: ["ame", "irys", "nerissa", "fuwawa", "mococo"] },
        ],
      },
       {
        id: "justice",
        question: "Which Justice member would you make out with?",
        type: "multi",
        options: [
          { label: "Gonathon",  members: ["mori", "kronii", "bae", "fuwawa", "mococo"] },
          { label: "Cecilia",  members: ["ina", "fauna", "shiori"] },
          { label: "Elizabeth",    members: ["gura", "mumei", "bijou", "kiara"] },
          { label: "Raora", members: ["ame", "irys", "nerissa"] },
        ],
      },
      {
        id: "fear",
        question: "What's your biggest fear in a dungeon?",
        type: "opinion",
        opinions: [
          { talent: "mori",    text: "Nothing. I am the scary thing." },
          { talent: "kiara",   text: "Getting separated from the team." },
          { talent: "ina",     text: "I think the person below likes feet, she also smells." },
          { talent: "gura",    text: "I like feet." },
          { talent: "ame",     text: "Timeline anomalies messing up my gear." },
          { talent: "irys",    text: "Undead. Ironically." },
          { talent: "fauna",   text: "Harming any creature we didn't have to." },
          { talent: "kronii",  text: "Losing track of time." },
          { talent: "mumei",   text: "Forgetting the map... or where we came from." },
          { talent: "bae",     text: "There are no fears, only opportunities for chaos." },
          { talent: "shiori",  text: "The lore being less interesting than I imagined." },
          { talent: "bijou",   text: "Stepping on a crystal by accident." },
          { talent: "nerissa", text: "Something grabbing my ankle in the dark." },
          { talent: "fuwawa",  text: "Mococo getting hurt." },
          { talent: "mococo",  text: "Fuwawa getting hurt." },
        ],
      },

    ],
  },
  // Add days 3–8 following the same shape…
};

export const TOTAL_DAYS = 8;