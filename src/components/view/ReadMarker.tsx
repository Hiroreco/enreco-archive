import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import React, { useEffect } from "react";

interface ReadMarkerProps {
    id: string;
}

const ReadMarker = ({ id }: ReadMarkerProps) => {
    const [checked, setChecked] = React.useState(false);

    const handleCheckedChange = (checked: boolean) => {
        setChecked(checked);
        localStorage.setItem(id, checked ? "read" : "unread");
    };

    useEffect(() => {
        const status = localStorage.getItem(id);
        if (status === "read") {
            setChecked(true);
        }
    }, [id]);

    return (
        <div className="mx-auto my-6 w-full flex items-center justify-center gap-2 z-50">
            <Label className="text-lg" htmlFor="read">
                Mark as Read
            </Label>
            <Checkbox
                id="read"
                onCheckedChange={handleCheckedChange}
                checked={checked}
                className="transition-all w-6 h-6 aspect-square"
            />
        </div>
    );
};

export default ReadMarker;
