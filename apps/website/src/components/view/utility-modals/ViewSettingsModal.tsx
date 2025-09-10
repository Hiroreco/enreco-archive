import {
    BackdropFilter,
    FontSize,
    Locale,
    useSettingStore,
} from "@/store/settingStore";
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
import { ThemeType } from "@enreco-archive/common/types";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    Activity,
    ALargeSmall,
    ClipboardCopy,
    Fullscreen,
    Languages,
    Music,
    SunMoon,
    Volume2,
    VolumeX,
    Wallpaper,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef } from "react";

interface ViewSettingsModalProps {
    open: boolean;
    onClose: () => void;
}

const ViewSettingsModal = ({ open, onClose }: ViewSettingsModalProps) => {
    const tSettings = useTranslations("modals.settings");
    const tCommon = useTranslations("common");

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
    const language = useSettingStore((state) => state.locale);
    const setLanguage = useSettingStore((state) => state.setLocale);

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
                    <DialogTitle>{tSettings("title")}</DialogTitle>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>
                        {tSettings("description")}
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex flex-col gap-4 p-2 overflow-y-scroll max-h-[50vh]">
                    <div className="flex flex-row justify-between items-center w-full">
                        <Label
                            htmlFor="enable-bgm"
                            className="flex items-center gap-1.5"
                        >
                            <Music size={20} />
                            {tSettings("backgroundMusic")}
                        </Label>
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
                        <Label
                            htmlFor="enable-sfx"
                            className="flex items-center gap-1.5"
                        >
                            <Activity size={20} />
                            {tSettings("soundEffects")}
                        </Label>
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
                        <Label
                            htmlFor="day-recap"
                            className="flex items-center gap-1.5"
                        >
                            <ClipboardCopy size={20} />
                            {tSettings("showRecapOnDayChange")}
                        </Label>
                        <Checkbox
                            onCheckedChange={setOpenDayRecapOnDayChange}
                            checked={openDayRecapOnDayChange}
                            id="day-recap"
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label
                            htmlFor="pan"
                            className="flex items-center gap-1.5"
                        >
                            <Fullscreen size={20} />
                            {tSettings("autoPanBackOnClose")}
                        </Label>
                        <Checkbox
                            onCheckedChange={setAutoPanBack}
                            checked={autoPanBack}
                            id="pan"
                        />
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label
                            htmlFor="backdrop-filter"
                            className="flex items-center gap-1.5"
                        >
                            <Wallpaper size={20} />
                            {tSettings("backdropFilter")}
                        </Label>
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
                                <SelectItem value="blur">
                                    {tSettings("blur")}
                                </SelectItem>
                                <SelectItem value="clear">
                                    {tSettings("clear")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label
                            htmlFor="theme-option"
                            className="flex items-center gap-1.5"
                        >
                            <SunMoon size={20} />
                            {tSettings("appTheme")}
                        </Label>
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
                                <SelectItem value="system">
                                    {tSettings("system")}
                                </SelectItem>
                                <SelectItem value="light">
                                    {tSettings("light")}
                                </SelectItem>
                                <SelectItem value="dark">
                                    {tSettings("dark")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label
                            htmlFor="font-size"
                            className="flex items-center gap-1.5"
                        >
                            <ALargeSmall size={20} />
                            {tSettings("fontSize")}
                        </Label>
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
                                <SelectItem value="small">
                                    {tSettings("small")}
                                </SelectItem>
                                <SelectItem value="medium">
                                    {tSettings("medium")}
                                </SelectItem>
                                <SelectItem value="large">
                                    {tSettings("large")}
                                </SelectItem>
                                <SelectItem value="xlarge">
                                    {tSettings("extraLarge")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <Label
                            htmlFor="language"
                            className="flex items-center gap-1.5"
                        >
                            <Languages size={20} />
                            {tSettings("language")}
                        </Label>
                        <Select
                            onValueChange={(value) =>
                                setLanguage(value as Locale)
                            }
                            value={language}
                        >
                            <SelectTrigger
                                id="language"
                                name="language"
                                className="w-[100px]"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">
                                    {tSettings("english")}
                                </SelectItem>
                                <SelectItem value="ja">
                                    {tSettings("japanese")}
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
                        {tCommon("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewSettingsModal;
