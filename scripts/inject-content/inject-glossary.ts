import type {
    CommonItemData,
    GalleryImage,
} from "@enreco-archive/common/types";
import fs from "fs/promises";
import path from "path";
import {
    CHARACTER_ORDER,
    GLOSSARY_LORE_GENERAL_ORDER,
    GLOSSARY_LORE_HEROES_STORYLINES_ORDER,
    GLOSSARY_MAIN_QUESTS_ORDER,
    GLOSSARY_MISC_MECHANICS,
    GLOSSARY_WEAPONS_ORDER,
    sortByPredefinedOrder,
} from "../content/orders.js";

// GlossaryPageData keyed by subcategory (immediate child of fileArg)
type GlossaryPageData = { [subcategory: string]: CommonItemData[] };

// Define sort orders for different categories and subcategories
const getSortOrder = (category: string, subcategory: string): string[] => {
    const key = `${category}.${subcategory}`;

    switch (key) {
        case "characters.heroes":
            return CHARACTER_ORDER;
        case "quests.main-quests":
            return GLOSSARY_MAIN_QUESTS_ORDER;
        case "weapons.revelations":
            return GLOSSARY_WEAPONS_ORDER;
        case "misc.mechanics":
            return GLOSSARY_MISC_MECHANICS;
        case "lore.general":
            return GLOSSARY_LORE_GENERAL_ORDER;
        case "lore.heroes-storylines":
            return GLOSSARY_LORE_HEROES_STORYLINES_ORDER;
        // Add more mappings as needed
        default:
            return []; // No specific order
    }
};

// Recursively collect all file paths under `dir`
async function walkDir(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files.push(...(await walkDir(full)));
        } else if (ent.isFile() && ent.name.endsWith(".md")) {
            files.push(full);
        }
    }
    return files;
}

async function processSubfolder(fileArg: string) {
    // Map to track items: subcategory -> id -> { en, ja }
    const itemMap = new Map<
        string,
        Map<
            string,
            { en: Partial<CommonItemData>; ja: Partial<CommonItemData> }
        >
    >();

    // Process both EN and JA locales
    for (const locale of ["en", "ja"] as const) {
        const baseDir = path.resolve(
            process.cwd(),
            locale === "en" ? "recap-data" : `recap-data_${locale}`,
            "glossary",
            fileArg,
        );

        // Ensure it exists and is a directory
        let stat;
        try {
            stat = await fs.stat(baseDir);
            if (!stat.isDirectory()) throw new Error();
        } catch {
            console.warn(`Skipping non-directory: ${baseDir}`);
            continue;
        }

        // List immediate subdirectories (these become keys in the output JSON)
        const subEntries = await fs.readdir(baseDir, { withFileTypes: true });
        const subfolders = subEntries
            .filter((e) => e.isDirectory())
            .map((e) => e.name);

        for (const subcat of subfolders) {
            const subDir = path.join(baseDir, subcat);
            // Find every .md under subDir (recursively)
            const mdPaths = await walkDir(subDir);

            if (!itemMap.has(subcat)) {
                itemMap.set(subcat, new Map());
            }
            const subcatMap = itemMap.get(subcat)!;

            for (const fullPath of mdPaths) {
                const id = path.basename(fullPath, ".md").replace("_ja", "");

                const raw = await fs.readFile(fullPath, "utf-8");
                const lines = raw.split(/\r?\n/);

                // parse HTML comments
                let title = "";
                let quote = "";
                let chapterArr: number[] = [];
                let imageTitles: string[] = [];
                let model = false;

                for (let i = 0; i < lines.length; i++) {
                    const l = lines[i].trim();
                    if (!l.startsWith("<!--")) continue;
                    const m = l.match(/^<!--\s*(\w+)\s*:\s*(.*?)\s*-->$/);
                    if (!m) continue;
                    const [, key, val] = m;

                    switch (key) {
                        case "title":
                            title = val;
                            break;

                        case "quote":
                            quote = val;
                            break;

                        case "chapters":
                            // split on commas, parse each as integer
                            chapterArr =
                                val
                                    .split(",")
                                    .map((s) => parseInt(s.trim(), 10))
                                    .filter((n) => !isNaN(n)) || [];
                            break;

                        case "images":
                            const t: string[] = [];
                            for (const m2 of val.matchAll(/\((.*?)\)/g)) {
                                t.push(m2[1]);
                            }
                            imageTitles = t;
                            break;

                        case "model":
                            model = val.toLowerCase() === "true";
                            break;
                    }
                }

                // find where comments end, skip blank line, then rest is content
                let idx = 0;
                while (
                    idx < lines.length &&
                    lines[idx].trim().startsWith("<!--")
                )
                    idx++;
                if (lines[idx]?.trim() === "") idx++;
                const content = lines.slice(idx).join("\n").trim();

                // build galleryImages
                const galleryImages: GalleryImage[] = imageTitles.map(
                    (t, i) => ({
                        title: t,
                        source: `/images-opt/${id}-${i}-opt.webp`,
                    }),
                );

                const thumbnailSrc = `/images-opt/${id}-opt-thumb.webp`;
                const modelSrc = model ? `/models/${id}.glb` : undefined;
                const imageSrc = model
                    ? undefined
                    : `/images-opt/${id}-opt.webp`;

                // Initialize entry if not exists
                if (!subcatMap.has(id)) {
                    subcatMap.set(id, {
                        en: {},
                        ja: {},
                    });
                }

                // Populate this locale's data
                const entry = subcatMap.get(id)!;
                (entry as any)[locale] = {
                    id,
                    title,
                    chapters: chapterArr,
                    quote: quote || undefined,
                    content,
                    thumbnailSrc,
                    galleryImages,
                    ...(model ? { modelSrc } : { imageSrc }),
                };
            }
        }

        console.log(
            `✅ Processed ${locale.toUpperCase()} glossary for '${fileArg}'`,
        );
    }

    // Build result with merged entries
    const result: { [subcategory: string]: CommonItemData[] } = {};

    for (const [subcat, subcatMap] of itemMap) {
        const items: CommonItemData[] = [];

        for (const [id, locales] of subcatMap) {
            // Merge both locales into a single item
            const enData = locales.en;
            const jaData = locales.ja;

            // Merge gallery images by index, creating localized titles
            const enGallery = enData.galleryImages || [];
            const jaGallery = jaData.galleryImages || [];
            const maxGalleryLength = Math.max(
                enGallery.length,
                jaGallery.length,
            );

            const mergedGalleryImages: GalleryImage[] = [];
            for (let i = 0; i < maxGalleryLength; i++) {
                const enImg = enGallery[i];
                const jaImg = jaGallery[i];
                mergedGalleryImages.push({
                    title: {
                        en: enImg?.title || "",
                        ja: jaImg?.title || "",
                    } as any,
                    source: enImg?.source || jaImg?.source || "",
                });
            }

            // Use EN data as base, but create localized fields
            const mergedItem: any = {
                id,
                title: {
                    en: enData.title || "",
                    ja: jaData.title || "",
                },
                chapters: enData.chapters || jaData.chapters || [],
                ...(enData.quote || jaData.quote
                    ? {
                          quote: {
                              en: enData.quote || "",
                              ja: jaData.quote || "",
                          },
                      }
                    : {}),
                content: {
                    en: enData.content || "",
                    ja: jaData.content || "",
                },
                thumbnailSrc: enData.thumbnailSrc || jaData.thumbnailSrc,
                galleryImages: mergedGalleryImages,
                ...(enData.modelSrc || jaData.modelSrc
                    ? {
                          modelSrc: enData.modelSrc || jaData.modelSrc,
                      }
                    : {}),
                ...(enData.imageSrc || jaData.imageSrc
                    ? {
                          imageSrc: enData.imageSrc || jaData.imageSrc,
                      }
                    : {}),
            };

            items.push(mergedItem);
        }

        // Sort items within this subcategory
        const sortOrder = getSortOrder(fileArg, subcat).map(
            (id) => id + "-entry",
        );
        if (sortOrder.length > 0) {
            const sortedItems = sortByPredefinedOrder(
                items,
                sortOrder,
                (item) => item.id,
                "alphabetical",
            );
            result[subcat] = sortedItems;
            console.log(
                `📊 Sorted ${items.length} items in ${fileArg}.${subcat} using predefined order`,
            );
        } else {
            result[subcat] = items;
            console.log(
                `📝 Kept original order for ${items.length} items in ${fileArg}.${subcat}`,
            );
        }
    }

    // Write JSON to apps/website/data/glossary/<fileArg>.json
    const outPath = path.resolve(
        process.cwd(),
        "apps",
        "website",
        "data",
        "glossary",
        `${fileArg}.json`,
    );
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(
        `✅ Injected and sorted subcategories of '${fileArg}' into ${outPath}`,
    );
}

async function main() {
    const baseGlossary = path.resolve(process.cwd(), "recap-data", "glossary");

    let subfolders: string[];
    try {
        subfolders = (await fs.readdir(baseGlossary, { withFileTypes: true }))
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
    } catch {
        console.error(`Directory not found: ${baseGlossary}`);
        process.exit(1);
    }

    for (const sub of subfolders) {
        await processSubfolder(sub);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
