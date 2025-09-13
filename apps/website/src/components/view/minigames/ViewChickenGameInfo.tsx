import TimestampHref from "@/components/view/markdown/TimestampHref";
import { useTranslations } from "next-intl";
import React from "react";
import Image from "next/image";

const ViewChickenGameInfo = () => {
    const t = useTranslations("modals.minigames.games.chicken");

    return (
        <div className="flex flex-col gap-4">
            <p>
                {t.rich("intro", {
                    bold: (chunks) => <strong>{chunks}</strong>,
                    icon: () => (
                        <Image
                            className="inline h-6 w-6 mb-1"
                            src={"/images-opt/ceruleancup-opt.webp"}
                            alt={"ceruleancup"}
                            width={24}
                            height={24}
                        />
                    ),
                })}
            </p>
            <p>{t("gameplay")}</p>
            <p>{t("simple")}</p>
            <TimestampHref
                href="https://www.youtube.com/live/Rd0awHHBTiA?feature=shared&t=6328"
                caption={t("timestampCaption")}
                type="embed"
            />
        </div>
    );
};

export default ViewChickenGameInfo;
