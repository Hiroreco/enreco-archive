import { LS_HAS_VISITED_GLOSSARY } from "@/lib/constants";
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

const ViewSpoilerModal = () => {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const hasVisited = localStorage.getItem(LS_HAS_VISITED_GLOSSARY);
        if (hasVisited !== "true") {
            setOpen(true);
            localStorage.setItem(LS_HAS_VISITED_GLOSSARY, "true");
        }
    }, []);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span className="inline-flex items-center gap-2">
                            <Siren className="w-5 h-5" />
                            Thou Shall Not Pass!
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Just a heads-up—this page has spoilers! If you haven’t
                        experienced the story of ENigmatic Recollection yet, you
                        might want to check it out first.
                        <span className="block mt-2 text-xs text-gray-400 italic">
                            *By continuing you agree to not hold the ENreco
                            Archive responsible for being spoiled.
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
                            <Button>Got it!</Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewSpoilerModal;
