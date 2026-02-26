import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { useTranslations } from "next-intl";

interface BingoDaySelectorProps {
    currentDay: string;
    onDayChange: (day: string) => void;
    disabled?: boolean;
}

const BingoDaySelector = ({
    currentDay,
    onDayChange,
    disabled,
}: BingoDaySelectorProps) => {
    const tCommon = useTranslations("common");

    return (
        <Select
            value={currentDay}
            onValueChange={onDayChange}
            disabled={disabled}
        >
            <SelectTrigger className="w-full min-w-20">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {Array.from({ length: 8 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                        {tCommon("day", { val: i + 1 })}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default BingoDaySelector;
