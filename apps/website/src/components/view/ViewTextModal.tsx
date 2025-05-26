import textData from "#/text-data.json";
import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { TextData } from "@enreco-archive/common/types";
import { BookOpenTextIcon } from "lucide-react";

interface ViewTextModalProps {
    textId: string;
    label: string;
}

const ViewTextModal = ({ textId, label }: ViewTextModalProps) => {
    const text = (textData as TextData)[textId];

    return (
        <Dialog>
            <DialogTrigger className="flex items-center gap-1 hover:text-accent transition-colors">
                {label} <BookOpenTextIcon />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{text.title || "No title"}</DialogTitle>
                </DialogHeader>
                <ViewMarkdown
                    className="px-2 overflow-y-auto max-h-[70vh] pb-10"
                    onNodeLinkClicked={() => {}}
                    onEdgeLinkClicked={() => {}}
                >
                    {text.content || "No content available."}
                </ViewMarkdown>
                <DialogFooter className="pt-4 border-t-2 ">
                    <DialogClose asChild>
                        <Button className="bg-accent text-lg text-accent-foreground w-full -mb-2">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewTextModal;
