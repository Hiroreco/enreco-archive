import TimestampHref from "@/components/view/markdown/TimestampHref";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const MemoryGameInfo = () => {
    const t = useTranslations("modals.minigames.games.memory");

    return (
        <div className="flex flex-col gap-4">
            <p>
                The{" "}
                {t.rich("intro", {
                    bold: (chunks) => <strong>{chunks}</strong>,
                    icon: () => (
                        <>
                            <Image
                                className="inline h-6 w-6 mb-1"
                                src={"/images-opt/scarletwand-opt.webp"}
                                alt={"scarletwand"}
                                width={24}
                                height={24}
                            />
                        </>
                    ),
                })}
            </p>
            <p>{t("gameplay")}</p>
            <p>{t("scoring")}</p>
            <p>{t("multiplayer")}</p>
            <TimestampHref
                href="https://www.youtube.com/live/iAYrdIlfVf0?feature=shared&t=4271"
                caption={t("timestampCaption")}
                type="embed"
            />
        </div>
    );
};

export default MemoryGameInfo;
