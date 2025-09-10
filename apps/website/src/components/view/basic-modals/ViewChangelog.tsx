import LocaleSwitcher from "@/components/view/basic-modals/LocaleSwitcher";
import { ViewMarkdown } from "@/components/view/markdown/ViewMarkdown";
import { useLocalizedData } from "@/hooks/useLocalizedData";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

interface ViewChangelogModalProps {
    open: boolean;
    onClose: () => void;
}

const ViewChangelogModal = ({ open, onClose }: ViewChangelogModalProps) => {
    const tCommon = useTranslations("common");
    const tChangelog = useTranslations("modals.changelog");
    const { getChangelog } = useLocalizedData();
    const changelogs = getChangelog();

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
            <DialogContent
                showXButton={false}
                className="rounded-lg h-[85vh] max-h-none max-w-[600px] md:w-[80vw] flex flex-col justify-end"
            >
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {tChangelog("title")}
                    </DialogTitle>

                    <DialogDescription className="text-center">
                        {tChangelog("description")}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-4 px-2">
                    <div className="flex flex-col gap-6 mt-4">
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
                            {tChangelog.rich("seeAllLogs", {
                                link: (chunk) => (
                                    <a
                                        href="https://github.com/Hiroreco/enreco-archive/tree/main/changelogs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {chunk}
                                    </a>
                                ),
                            })}
                        </div>

                        <Separator />

                        <div className="text-center text-sm text-foreground/60">
                            {tChangelog.rich("forQuestions", {
                                link: (chunk) => (
                                    <a
                                        href="https://x.com/hiroavrs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2"
                                    >
                                        {chunk}
                                    </a>
                                ),
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-row justify-end items-center w-full">
                    <LocaleSwitcher />
                    <DialogClose asChild>
                        <Button className="self-end min-w-20">
                            {tCommon("close")}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewChangelogModal;
