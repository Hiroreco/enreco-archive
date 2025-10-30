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
import { useTranslations } from "next-intl";

interface GlossaryInfoProps {
    category: Category;
}
const GlossaryInfo = ({ category }: GlossaryInfoProps) => {
    const tGlossary = useTranslations("glossary");

    let categoryInfo: React.ReactNode;
    switch (category) {
        case "cat-weapons":
            categoryInfo = (
                <div>
                    <p>{tGlossary("categoryInfo.weapons.description")}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {tGlossary.rich("categoryInfo.weapons.credit", {
                            link: (chunks) => (
                                <a
                                    href="https://x.com/S0LCreations"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {chunks}
                                </a>
                            ),
                        })}
                    </p>
                </div>
            );
            break;
        case "cat-characters":
            categoryInfo = (
                <div>
                    <p>{tGlossary("categoryInfo.characters.description")}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {tGlossary.rich("categoryInfo.characters.credit", {
                            link: (chunks) => (
                                <a
                                    href="https://x.com/DDOLBANG11"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {chunks}
                                </a>
                            ),
                        })}
                    </p>
                </div>
            );
            break;
        case "cat-lore":
            categoryInfo = (
                <div>
                    <p>{tGlossary("categoryInfo.lore.description")}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {tGlossary.rich("categoryInfo.lore.note", {
                            bold: (chunks) => <strong>{chunks}</strong>,
                        })}
                    </p>
                </div>
            );
            break;
        case "cat-quests":
            categoryInfo = (
                <div>{tGlossary("categoryInfo.quests.description")}</div>
            );
            break;
        case "cat-misc":
            categoryInfo = (
                <div>{tGlossary("categoryInfo.miscellaneous.description")}</div>
            );
            break;
    }

    return (
        <Dialog>
            <DialogTrigger
                title={tGlossary("navigation.viewCategoryInfo")}
                className="p-0 m-0"
            >
                <Info size={20} className="text-muted-foreground" />
            </DialogTrigger>
            <DialogContent showXButton={true} showXButtonForce={true}>
                <DialogHeader>
                    <DialogTitle>{tGlossary("info.generalInfo")}</DialogTitle>
                </DialogHeader>

                <DialogDescription asChild>{categoryInfo}</DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default GlossaryInfo;
