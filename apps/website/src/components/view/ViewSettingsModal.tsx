import { Button } from "@enreco-archive/common-ui/components/button";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { Label } from "@enreco-archive/common-ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Slider } from "@enreco-archive/common-ui/components/slider";
import { BackdropFilter, useSettingStore } from "@/store/settingStore";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ThemeType } from "@enreco-archive/common/types";

interface ViewSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ViewSettingsModal = ({ open, onOpenChange }: ViewSettingsModalProps) => {
    const settingStore = useSettingStore();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="rounded-lg space-y-2 max-h-[90vh]"
                showXButton={false}
            >
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>
                        Change the settings of the application
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex flex-col gap-4 p-2 overflow-y-scroll max-h-[50vh]">
                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="enable-bgm">Background Music</Label>
                        <Slider
                            defaultValue={[settingStore.bgmVolume]}
                            max={1}
                            step={0.01}
                            className="w-[150px]"
                            onValueChange={(value) =>
                                settingStore.setBgmVolume(value[0])
                            }
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="enable-bgm">Sound Effects</Label>
                        <Slider
                            defaultValue={[settingStore.sfxVolume]}
                            max={1}
                            step={0.01}
                            className="w-[150px]"
                            onValueChange={(value) =>
                                settingStore.setSfxVolume(value[0])
                            }
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="day-recap">
                            Show Recap On Day Change
                        </Label>
                        <Checkbox
                            onCheckedChange={
                                settingStore.setOpenDayRecapOnDayChange
                            }
                            checked={settingStore.openDayRecapOnDayChange}
                            id="day-recap"
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="pan">Auto Pan Back On Close</Label>
                        <Checkbox
                            onCheckedChange={settingStore.setAutoPanBack}
                            checked={settingStore.autoPanBack}
                            id="pan"
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="backdrop-filter">Backdrop Filter</Label>
                        <Select
                            onValueChange={(value) =>
                                settingStore.setBackdropFilter(
                                    value as BackdropFilter,
                                )
                            }
                            value={settingStore.backdropFilter}
                        >
                            <SelectTrigger
                                className="w-[100px]"
                                id="backdrop-filter"
                                name="backdrop-filter"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blur">Blur</SelectItem>
                                <SelectItem value="clear">Clear</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="theme-option">App Theme</Label>
                        <Select
                            onValueChange={(value) =>
                                settingStore.setThemeType(value as ThemeType)
                            }
                            value={settingStore.themeType}
                        >
                            <SelectTrigger
                                id="theme-option"
                                name="theme-option"
                                className="w-[100px]"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="system">System</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                <DialogFooter>
                    <Button
                        className="-mb-2 mt-2"
                        onClick={() => onOpenChange(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewSettingsModal;
