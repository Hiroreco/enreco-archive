import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { ChoicesSection } from "@/components/view/stats/ChoicesSection";
import { ContinuousSection } from "@/components/view/stats/ContinuousSection";
import { TeamsSection } from "@/components/view/stats/TeamSection";
import { TOTAL_DAYS, TRACKER_DATA } from "@/components/view/stats/data";
import { useTranslations } from "next-intl";
import { Separator } from "@enreco-archive/common-ui/components/separator";
import { Button } from "@enreco-archive/common-ui/components/button";
import StatsInfoModal from "@/components/view/stats/StatsInfoModal";

interface StatsModalProps {
    open: boolean;
    onClose: () => void;
}

export function StatsModal({ open, onClose }: StatsModalProps) {
    const t = useTranslations("modals.stats");
    const tCommon = useTranslations("common");
    const [day, setDay] = useState(1);
    const data = TRACKER_DATA[day];
    const prevData = day > 1 ? (TRACKER_DATA[day - 1] ?? null) : null;

    // If data is missing for a day, show a placeholder
    if (!data) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent
                    showXButton
                    showXButtonForce
                    className="max-w-4xl max-h-[90vh] overflow-y-auto"
                >
                    <DialogHeader>
                        <DialogTitle>{t("title")}</DialogTitle>
                    </DialogHeader>
                    <div className="py-12 text-center text-sm">
                        {t("noDataForDay", { day })}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader className="flex flex-row items-end justify-between border-b pb-2">
                    <DialogTitle asChild>
                        <div className="flex items-center gap-2">
                            <div className="text-xl font-bold">
                                {t("title")}
                            </div>
                            <StatsInfoModal />
                        </div>
                    </DialogTitle>
                    <div className="flex items-center gap-2.5">
                        <Select
                            value={day.toString()}
                            onValueChange={(val) => setDay(Number(val))}
                        >
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from(
                                    { length: TOTAL_DAYS },
                                    (_, i) => i + 1,
                                ).map((d) => (
                                    <SelectItem key={d} value={d.toString()}>
                                        {tCommon("day", { val: d })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </DialogHeader>
                <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4 max-h-[80dvh] overflow-y-auto">
                    <TeamsSection teams={data.teams} currentDay={day} />
                    <ContinuousSection
                        continuous={data.continuous}
                        prevData={prevData}
                        currentDay={day}
                    />
                    <ChoicesSection choices={data.choices} currentDay={day} />
                </div>
                <DialogFooter className="border-t pt-2">
                    <DialogClose asChild>
                        <Button>{tCommon("close")}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
