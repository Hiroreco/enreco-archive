import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewInfoGuide from "@/components/view/ViewInfoGuide";
import ViewInfoGeneral from "@/components/view/ViewInfoGeneral";

interface ViewInfoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ViewInfoModal = ({ open, onOpenChange }: ViewInfoModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <VisuallyHidden.Root>
                <DialogTitle>Info Modal</DialogTitle>
            </VisuallyHidden.Root>
            <DialogContent className="rounded-lg h-[85vh] max-h-none max-w-none md:w-[50vw] flex flex-col justify-end">
                <Tabs
                    defaultValue="general"
                    className="h-[80%] flex-1 flex flex-col"
                >
                    <TabsList className="flex-none w-full grid grid-cols-2">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="guide">Guide</TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="general"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10"
                    >
                        <ViewInfoGeneral />
                    </TabsContent>
                    <TabsContent
                        value="guide"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10"
                    >
                        <ViewInfoGuide />
                    </TabsContent>
                </Tabs>
                <DialogClose asChild>
                    <Button className="self-end">Close</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
};

export default ViewInfoModal;
