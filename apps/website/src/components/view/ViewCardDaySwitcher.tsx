import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@enreco-archive/common-ui/components/dropdownmenu";
import { FixedEdgeType, ImageNodeType } from "@enreco-archive/common/types";
import { ArrowDownUp } from "lucide-react";

interface ViewCardDaySwitcherProps {
    onDayChange: (newDay: number) => void;
    currentDay: number;
    availiableElements: ImageNodeType[] | FixedEdgeType[];
    showTitle?: boolean;
}

const ViewCardDaySwitcher = ({
    onDayChange,
    currentDay,
    availiableElements,
    showTitle = false,
}: ViewCardDaySwitcherProps) => {
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex mb-2 items-center gap-1 hover:text-accent transition-all">
                    <ArrowDownUp size={20} />
                    <div className="text-2xl font-bold underline underline-offset-4">
                        Day {currentDay + 1}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup
                        value={currentDay.toString()}
                        onValueChange={(val) => onDayChange(parseInt(val))}
                    >
                        {availiableElements.map((element, ind) => (
                            <DropdownMenuRadioItem
                                key={ind}
                                value={element.data!.day.toString()}
                                className="max-w-[300px] md:max-w-none"
                            >
                                <span className="truncate">
                                    Day {element.data!.day + 1}
                                    {showTitle && `: ${element.data!.title}`}
                                </span>
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default ViewCardDaySwitcher;
