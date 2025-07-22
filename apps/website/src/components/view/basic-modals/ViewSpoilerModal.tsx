import { LS_HAS_VISITED_GLOSSARY } from "@/lib/constants";
import { Button } from "@enreco-archive/common-ui/components/button";
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
                    <DialogTitle>Spoiler Alert!</DialogTitle>
                    <DialogDescription>
                        Just a heads-up—this page has spoilers! If you haven’t
                        experienced the story of ENigmatic Recollection yet, you
                        might want to check it out first.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button>Got it</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewSpoilerModal;
