import { ViewMarkdown } from "@/components/view/markdown/ViewMarkdown";
import changelogs from "#/changelogs.json";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback } from "react";
import { Separator } from "@enreco-archive/common-ui/components/separator";

interface ViewChangelogModalProps {
    open: boolean;
    onClose: () => void;
}

const ViewChangelogModal = ({ open, onClose }: ViewChangelogModalProps) => {
    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Changelog</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                showXButton={false}
                className="rounded-lg h-[85vh] max-h-none max-w-[600px] md:w-[80vw] flex flex-col justify-end"
            >
                <VisuallyHidden>
                    <DialogDescription>
                        View the changelog for the ENreco Archive
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-4 px-2">
                    <div className="flex flex-col gap-6 mt-4">
                        <div className="text-center">
                            <h2 className="font-bold text-2xl mb-2">
                                Changelog
                            </h2>
                            <p className="text-sm text-foreground/70">
                                Recent updates and changes to the ENreco Archive
                            </p>
                        </div>

                        {(
                            changelogs as Array<{
                                date: string;
                                content: string;
                            }>
                        ).map((entry, index) => (
                            <div
                                key={entry.date}
                                className={`border-l-4 pl-4 ${index === 0 ? "border-orange-500" : "border-green-500"}`} // Example: different colors for variety
                            >
                                <ViewMarkdown
                                    className="prose prose-sm prose-invert max-w-none"
                                    onEdgeLinkClicked={() => {}}
                                    onNodeLinkClicked={() => {}}
                                >
                                    {entry.content}
                                </ViewMarkdown>
                            </div>
                        ))}

                        <div className="text-center text-sm text-foreground/60">
                            <p>
                                See all changelogs{" "}
                                <a
                                    href="https://github.com/Hiroreco/enreco-archive/tree/main/changelogs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-2"
                                >
                                    here
                                </a>
                            </p>
                        </div>

                        <Separator />

                        <div className="text-center text-sm text-foreground/60">
                            <p>
                                For questions or to report issues, contact{" "}
                                <a
                                    href="https://x.com/hiroavrs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline underline-offset-2"
                                >
                                    @hiroavrs
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-end w-full">
                    <DialogClose asChild>
                        <Button className="self-end">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewChangelogModal;
