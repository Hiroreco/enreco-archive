import { Button } from "@enreco-archive/common-ui/components/button";
import { Siren } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@enreco-archive/common-ui/components/dialog";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LS_KEYS } from "@/lib/constants";

const ViewSpoilerModal = () => {
    const t = useTranslations("glossary.spoilers");

    const [open, setOpen] = useState(false);
    useEffect(() => {
        const hasVisited = localStorage.getItem(LS_KEYS.HAS_VISITED_GLOSSARY);
        if (hasVisited !== "true") {
            setOpen(true);
            localStorage.setItem(LS_KEYS.HAS_VISITED_GLOSSARY, "true");
        }
    }, []);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent backdropFilter="blur">
                <DialogHeader>
                    <DialogTitle>
                        <span className="inline-flex items-center gap-2">
                            <Siren className="w-5 h-5" />
                            {t("title")}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        {t("description")}
                        <span className="block mt-2 text-xs text-gray-400 italic">
                            {t("agree")}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center mt-4 gap-4">
                    <Image
                        src="images-opt/easter-gremliz-opt.webp"
                        alt="Easter Gremliz"
                        className="h-[100px] w-auto opacity-90"
                        width={100}
                        height={100}
                        priority={true}
                    />
                    <DialogFooter className="w-full">
                        <DialogClose asChild className="w-full">
                            <Button>{t("ok")}</Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewSpoilerModal;
