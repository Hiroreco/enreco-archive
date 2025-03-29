import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "@/components/viewitems/Items.css";
import ViewItemSelector from "@/components/viewitems/ViewItemSelector";
import ViewItemViewer from "@/components/viewitems/ViewItemViewer";
import { CommonItemData } from "@/lib/type";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

const ViewWeaponsCard = () => {
    const dummyItem: CommonItemData = {
        name: "Shiori's Feather",
        thumbnailSrc:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzAjYuDQF-128q3hUkjcF9083_plzAKNFMsg&s",
        content: "A feather from Shiori.",
        modelSrc: "/models/pen.gltf",
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

            <CardContent className="flex-1">
                {selectedItem === null && (
                    <div className="grid grid-cols-10 gap-4">
                        <ViewItemSelector
                            item={dummyItem}
                            onItemClick={(item) => {
                                setSelectedItem(item);
                            }}
                        />
                    </div>
                )}
                {selectedItem !== null && (
                    <ViewItemViewer item={selectedItem} />
                )}
            </CardContent>
        </Card>
    );
};

export default ViewWeaponsCard;
