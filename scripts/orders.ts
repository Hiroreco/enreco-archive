// Yes this is a duplicate of what's being used on the site
// I'm too lazy to fix the import issues stuff so yeah

export const CHARACTER_ORDER = [
    "ame",
    "gura",
    "calli",
    "kiara",
    "ina",
    "irys",
    "kronii",
    "bae",
    "fauna",
    "mumei",
    "bijou",
    "nerissa",
    "shiori",
    "fuwawa",
    "mococo",
    "liz",
    "cecilia",
    "gigi",
    "raora",
    "iphania",
];

export const GLOSSARY_MAIN_QUESTS_ORDER = [
    "heart-of-ruin",
    "stronghold-of-ruin",
    "star-site-chaos",
    "star-site-chronos",
    "star-site-elpis",
    "ancient-sewers-dungeon",
    "volcano-dungeon",
    "eldritch-horror-dungeon",
    "ocean-temple-dungeon",
    "underworld-dungeon",
];

export const GLOSSARY_LORE_GENERAL_ORDER = [
    "libestal-ancient",
    "libestal-ficta",
    "library",
    "sanctuary",
    "stains",
    "revelations",
    "libestans",
];

export const GLOSSARY_LORE_LOCATIONS_ORDER = ["library", "sanctuary"];

export const GLOSSARY_LORE_HEROES_STORYLINES_ORDER = [
    "maven-in-blue",
    "humble-knight-witch",
    "hot-pink-one-collapse",
    "oh-princess",
    "custody-dispute",
    "fluffy-cafe",
    "inbread",
    "the-corruption",
    "a-knights-tale",
    "fire-and-flight",
    "lottery-fiasco",
    "faunamart",
];

export const GLOSSARY_MISC_MECHANICS = ["jobs", "minigames", "guilds"];

export const GLOSSARY_WEAPONS_ORDER = [
    "eye-of-wisdom",
    "oceanic-terror",
    "rest-in-peace",
    "burning-phoenix",
    "violet-miasma",
    "light-and-darkness",
    "chrono-surge",
    "chaos-stampede",
    "natures-grace",
    "winds-of-civilization",
    "shining-emotions",
    "resonant-strike",
    "bookmark-of-memories",
    "azure-claws",
    "fuchsia-claws",
    "thorn-of-order",
    "automaton-assault",
    "gremlin-grenade",
    "purrfect-execution",
];
export const GLOSSARY_CHARACTER_ORDER = CHARACTER_ORDER.map((id) => {
    return id + "-entry";
});

export const FANART_CHARACTER_ORDER = [...CHARACTER_ORDER, "iphania"];

/**
 * Sorts an array based on a predefined order array
 * @param items - Array of items to sort
 * @param orderArray - Array defining the desired order
 * @param getKey - Function to extract the key from each item (defaults to identity)
 * @param fallbackSort - How to sort items not in orderArray ('start' | 'end' | 'alphabetical')
 */
export function sortByPredefinedOrder<T>(
    items: T[],
    orderArray: string[],
    getKey: (item: T) => string = (item) => String(item),
    fallbackSort: "start" | "end" | "alphabetical" = "end",
): T[] {
    const orderMap = new Map(orderArray.map((key, index) => [key, index]));

    const tmp = [...items].sort((a, b) => {
        const keyA = getKey(a);
        const keyB = getKey(b);

        const indexA = orderMap.get(keyA);
        const indexB = orderMap.get(keyB);

        // Both items are in the order array
        if (indexA !== undefined && indexB !== undefined) {
            return indexA - indexB;
        }

        // Only A is in the order array
        if (indexA !== undefined && indexB === undefined) {
            return fallbackSort === "start" ? 1 : -1;
        }

        // Only B is in the order array
        if (indexA === undefined && indexB !== undefined) {
            return fallbackSort === "start" ? -1 : 1;
        }

        // Neither is in the order array
        if (fallbackSort === "alphabetical") {
            return keyA.localeCompare(keyB);
        }
        // Keep original order for items not in orderArray
        return 0;
    });
    return tmp;
}
