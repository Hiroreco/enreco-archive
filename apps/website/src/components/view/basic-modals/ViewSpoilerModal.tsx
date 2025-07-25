import { LS_HAS_VISITED_GLOSSARY } from "@/lib/constants";
import { Button } from "@enreco-archive/common-ui/components/button";
import { Siren } from 'lucide-react';
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
                        <div className="mt-2 text-[10px] text-gray-500 italic">
                            *By clicking this button you agree to not hold the ENreco Archive responsible for being spoiled.
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center mt-6 gap-4">
                    <img
                        src="images-opt/easter-gremliz-opt.webp"
                        alt="Easter Gremliz"
                        className="max-h-[40vh] h-auto w-full max-w-xs object-contain opacity-90"
                    />
                    <DialogFooter className="w-full flex justify-center">
                        <DialogClose asChild>
                            <Button>Got it!</Button>
                        </DialogClose>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewSpoilerModal;
