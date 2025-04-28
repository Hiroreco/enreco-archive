import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "@/components/viewitems/Items.css";
import ViewItemSelector from "@/components/viewitems/ViewItemSelector";
import ViewItemViewer from "@/components/viewitems/ViewItemViewer";
import { CommonItemData } from "@/lib/type";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

const ViewWeaponsCard = () => {
    const dummyItem: CommonItemData = {
        id: "shiori-feather",
        name: "Bookmark of Memories",
        thumbnailSrc:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzAjYuDQF-128q3hUkjcF9083_plzAKNFMsg&s",
        content:
            "### <u>Description</u> \n**Bookmark of Memories**, Shiori Novella's Revelation, takes the form of a blue feather—more precisely, a quill meant for writing. It was bestowed upon her when she was first summoned to the Kingdom of Libestal. \n\n### <u>Ability and Story</u> \nWhen activated, the quill summons bookmarks that hover around Shiori, firing beams that converge at her target. Upon impact, the beams explode, dealing significant damage. \n\nThe quill serves as a subtle reminder of her role as an *Archiver*—a past she no longer remembers. Perhaps it was this lack of recollection that led her to use it for mischief rather than battle, often opting to tickle people with it instead. Unfortunately, she tended to forget that doing so could accidentally trigger its ability, much to the misfortune of any unsuspecting bystanders.\n\n[Explosive Tickling](#embed:https://www.youtube.com/live/LTIq_0ykLVA?feature=shared&t=7821)",
        modelSrc: "/models/pen.gltf",
        galleryImages: [
            {
                source: "images-opt/weapon-shiori-0.webp",
                title: "Shiori's first time acquiring the quill",
            },
            {
                source: "images-opt/weapon-shiori-2.webp",
                title: "The quill viewed from the inventory",
            },
            {
                source: "/images-opt/weapon-shiori-1.webp",
                title: "Shiori blasting her revelation towards a bystander",
            },
        ],
    };

    const [selectedItem, setSelectedItem] = useState<CommonItemData | null>(
        null,
    );

    return (
        <Card className="items-card flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {selectedItem !== null && (
                        <ChevronLeft
                            className="cursor-pointer"
                            onClick={() => setSelectedItem(null)}
                        />
                    )}
                    Weapons
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[65vh] sm:h-[75vh] p-4">
                <AnimatePresence mode="wait">
                    {selectedItem === null && (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full p-2 overflow-x-hidden overflow-y-auto grid md:grid-cols-2 lg:grid-cols-3 place-items-center gap-4"
                        >
                            {Array(16)
                                .fill(null)
                                .map((_, index) => (
                                    <ViewItemSelector
                                        key={index}
                                        item={dummyItem}
                                        onItemClick={(item) =>
                                            setSelectedItem(item)
                                        }
                                    />
                                ))}
                        </motion.div>
                    )}
                    {selectedItem !== null && (
                        <motion.div
                            className="h-full"
                            key="viewer"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <ViewItemViewer item={selectedItem} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

export default ViewWeaponsCard;
