import { LS_KEYS } from "@/lib/constants";
import { FEATURE_KEYS } from "@/lib/constants";
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
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

const ViewUpdateLaterDisclaimerModal = () => {
    const tCommon = useTranslations("common");

    const [open, setOpen] = useState(false);
    useEffect(() => {
        const hasVisited = localStorage.getItem(
            LS_KEYS.HAS_VISITED_UPDATE_LATER_DISCLAIMER,
        );
        if (
            hasVisited !== "true" &&
            FEATURE_KEYS.ENABLE_UPDATE_LATER_DISCLAIMER
        ) {
            setOpen(true);
            localStorage.setItem(
                LS_KEYS.HAS_VISITED_UPDATE_LATER_DISCLAIMER,
                "true",
            );
        }
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent backdropFilter="blur">
                <DialogHeader>
                    <DialogTitle>
                        <span className="inline-flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Heads up!
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        <span className="block">
                            The content related to the ongoing chapter in this
                            section won't be updated until the chapter is over,
                            as the team is currently focused on updating the
                            daily recaps.
                        </span>
                        <span className="block mt-2">
                            Thank you for your understanding and patience!
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center mt-4 gap-4">
                    <Image
                        src="images-opt/easter-cecilia-opt.webp"
                        alt="Easter Cecilia"
                        className="h-[100px] w-auto opacity-90"
                        width={100}
                        height={100}
                        priority={true}
                    />
                    <DialogFooter className="w-full">
                        <DialogClose asChild className="w-full">
                            <Button>{tCommon("ok")}</Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewUpdateLaterDisclaimerModal;
