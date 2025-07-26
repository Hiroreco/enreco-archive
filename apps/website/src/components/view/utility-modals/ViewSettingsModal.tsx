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
import {
    BackdropFilter,
    FontSize,
    useSettingStore,
} from "@/store/settingStore";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ThemeType } from "@enreco-archive/common/types";
import { useCallback, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface ViewSettingsModalProps {
    open: boolean;
    onClose: () => void;
}

const ViewSettingsModal = ({ open, onClose }: ViewSettingsModalProps) => {
    const bgmVolume = useSettingStore((state) => state.bgmVolume);
    const setBgmVolume = useSettingStore((state) => state.setBgmVolume);
    const sfxVolume = useSettingStore((state) => state.sfxVolume);
    const setSfxVolume = useSettingStore((state) => state.setSfxVolume);
    const openDayRecapOnDayChange = useSettingStore(
        (state) => state.openDayRecapOnDayChange,
    );
    const setOpenDayRecapOnDayChange = useSettingStore(
        (state) => state.setOpenDayRecapOnDayChange,
    );
    const autoPanBack = useSettingStore((state) => state.autoPanBack);
    const setAutoPanBack = useSettingStore((state) => state.setAutoPanBack);
    const backdropFilter = useSettingStore((state) => state.backdropFilter);
    const setBackdropFilter = useSettingStore(
        (state) => state.setBackdropFilter,
    );
    const themeType = useSettingStore((state) => state.themeType);
    const setThemeType = useSettingStore((state) => state.setThemeType);
    const fontSize = useSettingStore((state) => state.fontSize);
    const setFontSize = useSettingStore((state) => state.setFontSize);

    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );

    const previousBGMVolumeBeforeMute = useRef(bgmVolume);
    const previousSFXVolumeBeforeMute = useRef(sfxVolume);

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
                        <div className="flex items-center justify-between gap-2 w-[150px]">
                            <button
                                onClick={() => {
                                    if (bgmVolume > 0) {
                                        previousBGMVolumeBeforeMute.current =
                                            bgmVolume;
                                        setBgmVolume(0);
                                    } else {
                                        setBgmVolume(
                                            previousBGMVolumeBeforeMute.current,
                                        );
                                    }
                                }}
                            >
                                {bgmVolume > 0 ? (
                                    <Volume2 size={16} />
                                ) : (
                                    <VolumeX size={16} />
                                )}
                            </button>
                            <Slider
                                defaultValue={[bgmVolume]}
                                value={[bgmVolume]}
                                max={1}
                                step={0.01}
                                className="grow"
                                onValueChange={(value) =>
                                    setBgmVolume(value[0])
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="enable-sfx">Sound Effects</Label>
                        <div className="flex items-center justify-between gap-2 w-[150px]">
                            <button
                                onClick={() => {
                                    if (sfxVolume > 0) {
                                        previousSFXVolumeBeforeMute.current =
                                            sfxVolume;
                                        setSfxVolume(0);
                                    } else {
                                        setSfxVolume(
                                            previousSFXVolumeBeforeMute.current,
                                        );
                                    }
                                }}
                            >
                                {sfxVolume > 0 ? (
                                    <Volume2 size={16} />
                                ) : (
                                    <VolumeX size={16} />
                                )}
                            </button>
                            <Slider
                                defaultValue={[sfxVolume]}
                                value={[sfxVolume]}
                                max={1}
                                step={0.01}
                                className="grow"
                                onValueChange={(value) =>
                                    setSfxVolume(value[0])
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="day-recap">
                            Show Recap On Day Change
                        </Label>
                        <Checkbox
                            onCheckedChange={setOpenDayRecapOnDayChange}
                            checked={openDayRecapOnDayChange}
                            id="day-recap"
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="pan">Auto Pan Back On Close</Label>
                        <Checkbox
                            onCheckedChange={setAutoPanBack}
                            checked={autoPanBack}
                            id="pan"
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="backdrop-filter">Backdrop Filter</Label>
                        <Select
                            onValueChange={(value) =>
                                setBackdropFilter(value as BackdropFilter)
                            }
                            value={backdropFilter}
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
                                setThemeType(value as ThemeType)
                            }
                            value={themeType}
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

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label htmlFor="font-size">Font Size</Label>
                        <Select
                            onValueChange={(value) =>
                                setFontSize(value as FontSize)
                            }
                            value={fontSize}
                        >
                            <SelectTrigger
                                id="font-size"
                                name="font-size"
                                className="w-[100px]"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                                <SelectItem value="xlarge">
                                    Extra Large
                                </SelectItem>
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
