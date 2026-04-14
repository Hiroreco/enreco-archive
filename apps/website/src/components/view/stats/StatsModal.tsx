import {
    Dialog,
    DialogContent,
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

interface StatsModalProps {
    open: boolean;
    onClose: () => void;
}

export function StatsModal({ open, onClose }: StatsModalProps) {
    const t = useTranslations("modals.stats");
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
            <DialogContent showXButton showXButtonForce className="max-w-4xl">
                <DialogHeader className="flex flex-row items-start justify-between">
                    <DialogTitle>{t("title")}</DialogTitle>
                    <div className="flex items-center gap-2.5">
                        <label className="text-xs">{t("day")}</label>
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
                                        {t("day")} {d}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </DialogHeader>
                <div className="flex flex-col gap-8 py-6 max-w-5xl mx-auto px-4  max-h-[80dvh] overflow-y-auto">
                    <TeamsSection teams={data.teams} />
                    <ContinuousSection
                        continuous={data.continuous}
                        prevData={prevData}
                    />
                    <ChoicesSection choices={data.choices} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
