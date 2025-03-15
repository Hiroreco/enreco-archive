import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAudioStore } from "@/store/audioStore";
import React, { useEffect } from "react";

interface ReadMarkerProps {
    id: string;
    read: boolean | undefined;
}

const ReadMarker = ({ id, read }: ReadMarkerProps) => {
    const [checked, setChecked] = React.useState(false);
    const audioStore = useAudioStore();

    const handleCheckedChange = (checked: boolean) => {
        if (checked) {
            audioStore.playSFX("xp");
        }
        setChecked(checked);
        localStorage.setItem(id, checked ? "read" : "unread");
    };

    useEffect(() => {
        setChecked(read || false);
    }, [id, read]);

    return (
        <div className="mx-auto my-6 w-full flex items-center justify-center gap-2 z-50">
            <Label className="text-lg" htmlFor="read">
                Mark as Read
            </Label>
            <Checkbox
                id="read"
                onCheckedChange={handleCheckedChange}
                checked={checked}
                className="transition-all w-6 h-6 aspect-square border-2"
            />
        </div>
    );
};

export default ReadMarker;
