import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditorDaySelectProps {
    day: number;
    numberOfDays: number;
    onValueChange: (value: number) => void;
    className?: string;
}

export default function EditorDaySelect({
    day,
    numberOfDays,
    onValueChange,
    className,
}: EditorDaySelectProps) {
    return (
        <Select
            value={day?.toString()}
            onValueChange={(value: string) => onValueChange(parseInt(value))}
        >
            <SelectTrigger
                disabled={numberOfDays === 0}
                className={className}
                useUpChevron={false}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent side={"bottom"}>
                {[...Array(numberOfDays).keys()].map((index) => (
                    <SelectItem key={index} value={index.toString()}>
                        {`Day ${index + 1}`}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
