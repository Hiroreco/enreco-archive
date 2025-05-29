import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";
import ViewInfoGuide from "@/components/view/ViewInfoGuide";
import ViewInfoGeneral from "@/components/view/ViewInfoGeneral";
import { useSettingStore } from "@/store/settingStore";
import { Moon, Sun, SunMoon } from "lucide-react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import ViewInfoCredits from "@/components/view/ViewInfoCredits";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ViewInfoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ViewInfoModal = ({ open, onOpenChange }: ViewInfoModalProps) => {
    const themeType = useSettingStore((state) => state.themeType);
    const setThemeType = useSettingStore((state) => state.setThemeType);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Info Modal</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                showXButton={false}
                className="rounded-lg h-[85vh] max-h-none max-w-[800px] md:w-[80vw] flex flex-col justify-end"
                backdropFilter={backdropFilter}
            >
                <VisuallyHidden>
                    <DialogDescription>
                        View information about the application
                    </DialogDescription>
                </VisuallyHidden>

                <Tabs
                    defaultValue="general"
                    className="h-[80%] flex-1 flex flex-col"
                >
                    <TabsList className="flex-none w-full grid grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="guide">Guide</TabsTrigger>
                        <TabsTrigger value="credits">Credits</TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="general"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10 px-2"
                    >
                        <ViewInfoGeneral />
                    </TabsContent>
                    <TabsContent
                        value="guide"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10 px-2"
                    >
                        <ViewInfoGuide />
                    </TabsContent>
                    <TabsContent
                        value="credits"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10 px-2"
                    >
                        <ViewInfoCredits />
                    </TabsContent>
                </Tabs>
                <DialogFooter className="flex items-center flex-row justify-between sm:justify-between w-full">
                    {/* Theme Toggle */}
                    <ToggleGroup.Root
                        type="single"
                        value={themeType}
                        onValueChange={setThemeType}
                    >
                        <ToggleGroup.Item
                            value="light"
                            className="mx-0.5 cursor-pointer text-foreground bg-background data-[state=on]:bg-accent hover:bg-accent transition-colors rounded-lg p-1"
                        >
                            <Sun className="h-8 w-8" />
                        </ToggleGroup.Item>
                        <ToggleGroup.Item
                            value="dark"
                            className="mx-0.5 cursor-pointer text-foreground bg-background data-[state=on]:bg-accent hover:bg-accent transition-colors rounded-lg p-1"
                        >
                            <Moon className="h-8 w-8" />
                        </ToggleGroup.Item>
                        <ToggleGroup.Item
                            value="system"
                            className="mx-0.5 cursor-pointer text-foreground bg-background data-[state=on]:bg-accent hover:bg-accent transition-colors rounded-lg p-1"
                        >
                            <SunMoon className="h-8 w-8" />
                        </ToggleGroup.Item>
                    </ToggleGroup.Root>

                    <DialogClose asChild>
                        <Button className="self-end">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewInfoModal;
