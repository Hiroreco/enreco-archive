import { Category } from "@/contexts/GlossaryContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { Info } from "lucide-react";

interface ViewGlossaryInfoProps {
    category: Category;
}
const ViewGlossaryInfo = ({ category }: ViewGlossaryInfoProps) => {
    let categoryInfo: React.ReactNode;
    switch (category) {
        case "cat-weapons":
            categoryInfo = (
                <div>
                    This category contains information about the weapons, known
                    as Revelations, used by the heroes — including their
                    abilities, appearances, and other related details.
                </div>
            );
            break;
        case "cat-characters":
            categoryInfo = (
                <div>
                    This category contains information about characters, their
                    personalities, and their stories in each chapter.
                </div>
            );
            break;
        case "cat-lore":
            categoryInfo = (
                <div>
                    <div>
                        This category contains information about the story of
                        ENigmatic Recollection, including both official
                        in-universe lore and self-made stories created by the
                        heroes.
                    </div>
                    <div className="mt-2 italic">
                        <strong>Note:</strong> Regarding the heroes' stories,
                        only consistent and prevalent ones are included in this
                        category.
                    </div>
                </div>
            );
            break;
        case "cat-quests":
            categoryInfo = (
                <div>
                    This category contains information about the journey's
                    quests, specifically the dungeons and missions required to
                    advance the story.
                </div>
            );
            break;
        case "cat-misc":
            categoryInfo = (
                <div>
                    This category contains information about miscellaneous
                    topics in the ENreco universe, including its mechanics,
                    special events, and other related details.
                </div>
            );
            break;
    }

    return (
        <Dialog>
            <DialogTrigger title="View Category Info" className="p-0 m-0">
                <Info size={16} className="text-muted-foreground" />
            </DialogTrigger>
            <DialogContent 
                showXButton={true}
                showXButtonForce={true}
            >
                <DialogHeader>
                    <DialogTitle>
                        {category === "cat-weapons" && "Weapons"}
                        {category === "cat-characters" && "Characters"}
                        {category === "cat-lore" && "Lore"}
                        {category === "cat-quests" && "Quests"}
                        {category === "cat-misc" && "Miscellaneous"}
                    </DialogTitle>
                </DialogHeader>

                <DialogDescription asChild>
                    <div className="text-sm text-muted-foreground">{categoryInfo}</div>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default ViewGlossaryInfo;
