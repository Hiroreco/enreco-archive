import { useAudioStore } from "@/store/audioStore";
import { Checkbox } from "@enreco-archive/common-ui/components/checkbox";
import { Label } from "@enreco-archive/common-ui/components/label";
import { useTranslations } from "next-intl";

interface ReadMarkerProps {
    read: boolean;
    setRead: (readStatus: boolean) => void;
}

const ReadMarker = ({ read, setRead }: ReadMarkerProps) => {
    const playSFX = useAudioStore((state) => state.playSFX);
    const tCommon = useTranslations("common");

    const handleCheckedChange = (checked: boolean | "indeterminate") => {
        if (checked) {
            playSFX("xp");
        }
        setRead(checked === "indeterminate" ? false : checked);
    };

    return (
        <div className="mx-auto my-6 w-full flex items-center justify-center gap-2 z-50">
            <Label className="text-lg" htmlFor="read">
                {tCommon("markAsRead")}
            </Label>
            <Checkbox
                id="read"
                onCheckedChange={handleCheckedChange}
                checked={read}
                className="transition-all w-6 h-6 aspect-square border-2"
            />
        </div>
    );
};

export default ReadMarker;
