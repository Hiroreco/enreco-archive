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
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface InfoGuideCardProps {
    title: string;
    description: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
}

const InfoGuideCard = ({
    title,
    description,
    content,
    icon,
}: InfoGuideCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const tCommon = useTranslations("common");

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex flex-col gap-2 p-4 rounded-lg border border-foreground/20 bg-background hover:bg-accent/10 transition-colors text-left hover:border-foreground/40 cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    {icon && <div>{icon}</div>}
                    <div className="font-bold">{title}</div>
                </div>
                <p className="text-sm text-foreground/70">{description}</p>
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 mt-4 max-h-[60vh] overflow-y-auto px-2">
                        <div className="text-foreground/80">{content}</div>
                    </div>

                    <DialogFooter className="border-t pt-4 mt-2">
                        <DialogClose asChild>
                            <Button>{tCommon("close")}</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default InfoGuideCard;
