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
import InfoGuide from "@/components/view/basic-modals/InfoGuide";
import InfoGeneral from "@/components/view/basic-modals/InfoGeneral";
import { useSettingStore } from "@/store/settingStore";
import { Moon, Sun, SunMoon } from "lucide-react";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import InfoCredits from "@/components/view/basic-modals/InfoCredits";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/view/basic-modals/LocaleSwitcher";

interface InfoModalProps {
    open: boolean;
    onClose: () => void;
}

const InfoModal = ({ open, onClose }: InfoModalProps) => {
    const tInfoTabs = useTranslations("modals.infoTabs");
    const tCommon = useTranslations("common");

    const themeType = useSettingStore((state) => state.themeType);
    const setThemeType = useSettingStore((state) => state.setThemeType);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);

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
                <DialogTitle>Info Modal</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                showXButton={false}
                className="rounded-lg h-[85vh] max-h-none max-w-[800px] md:w-[80vw] flex flex-col justify-end"
                backdropFilter={backdropFilter}
            >
                <VisuallyHidden>
                    <DialogDescription>
                        View general information about ENreco Archive
                    </DialogDescription>
                </VisuallyHidden>

                <Tabs
                    defaultValue="general"
                    className="h-[80%] flex-1 flex flex-col"
                >
                    <TabsList className="flex-none w-full grid grid-cols-3">
                        <TabsTrigger value="general">
                            {tInfoTabs("general")}
                        </TabsTrigger>
                        <TabsTrigger value="guide">
                            {tInfoTabs("guide")}
                        </TabsTrigger>
                        <TabsTrigger value="credits">
                            {tInfoTabs("credits")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="general"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10 px-2"
                    >
                        <InfoGeneral />
                    </TabsContent>
                    <TabsContent
                        value="guide"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10 px-2"
                    >
                        <InfoGuide />
                    </TabsContent>
                    <TabsContent
                        value="credits"
                        className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-10 px-2"
                    >
                        <InfoCredits />
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

                    <div className="flex items-center gap-2">
                        <LocaleSwitcher />
                        <DialogClose asChild>
                            <Button className="self-end min-w-20">
                                {tCommon("close")}
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InfoModal;
