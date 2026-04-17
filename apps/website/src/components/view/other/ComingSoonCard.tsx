import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useMemo } from "react";

function getLocalTimeForUTC(utcHours: number, utcMinutes: number = 0): string {
    const now = new Date();
    const utcDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), utcHours, utcMinutes)
    );
    const formatter = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return formatter.format(utcDate);
}

const ComingSoonCard = () => {
    const t = useTranslations("comingSoonCard");

    const jstLocalTime = useMemo(() => getLocalTimeForUTC(17), []);

    return (
        <div className="rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/90 border border-border shadow-lg p-8 text-foreground z-10 min-w-sm max-w-lg">
            {/* Main Event Text */}
            <p className="text-base leading-relaxed mb-8 text-center max-w-sm mx-auto">
                {t.rich("text1", {
                    bold: (chunks) => <strong className="font-semibold">{chunks}</strong>,
                })}
            </p>

            {/* Schedule Section */}
            <div className="space-y-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("updateSchedule")}
                </p>
                <div className="grid grid-cols-3 gap-4 bg-muted/30 rounded-md p-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">JST</p>
                        <p className="font-mono font-semibold text-sm">{t("jstTime")}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">PST</p>
                        <p className="font-mono font-semibold text-sm">{t("pstTime")}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t("localTimezone")}</p>
                        <p className="font-mono font-semibold text-sm">{jstLocalTime}</p>
                    </div>
                </div>

                {/* Local Timezone */}
                <div className="py-2 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground mx-auto max-w-sm">
                        {t("note")}
                    </p>
                </div>
            </div>

            {/* News Link */}
            <div className="pt-4 border-t border-border">
                <p className="text-sm text-center mx-auto max-w-sm">
                    {t.rich("text2", {
                        link: (chunks) => (
                            <a
                                href="https://twitter.com/hiroavrs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-2 hover:text-foreground transition-colors"
                            >
                                {chunks}
                            </a>
                        ),
                    })}
                </p>
            </div>

            <div
                className="-z-10 absolute bottom-0 right-2 h-[100px] overflow-hidden"
            >
                <Image
                    width={80}
                    height={80}
                    src="images-opt/easter-gremliz-opt.webp"
                    className="mx-auto opacity-50 translate-y-[50%]"
                    alt="potato salid"
                    priority={true}
                />
            </div>
        </div>
    );
};

export default ComingSoonCard;
