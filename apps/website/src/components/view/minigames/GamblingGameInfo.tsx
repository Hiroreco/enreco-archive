import TimestampHref from "@/components/view/markdown/TimestampHref";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const GamblingGameInfo = () => {
    const t = useTranslations("modals.minigames.games.gambling");

    return (
        <div className="flex flex-col gap-4">
            <p>
                {t.rich("intro", {
                    bold: (chunks) => <strong>{chunks}</strong>,
                    icon: () => (
                        <Image
                            className="inline h-6 w-6 mb-1"
                            src={"/images-opt/ambercoin-opt.webp"}
                            alt={"ambercoin"}
                            width={24}
                            height={24}
                        />
                    ),
                })}
            </p>
            <p>{t("rules")}</p>
            <ul>
                <li>
                    {t.rich("blueSquares", {
                        color: (chunks) => (
                            <span className="text-blue-600">{chunks}</span>
                        ),
                    })}
                </li>
                <li>
                    {t.rich("greenSquares", {
                        color: (chunks) => (
                            <span className="text-green-600">{chunks}</span>
                        ),
                    })}
                </li>
                <li>
                    {t.rich("yellowSquares", {
                        color: (chunks) => (
                            <span className="text-yellow-600">{chunks}</span>
                        ),
                    })}
                </li>
                <li>
                    {t.rich("redSquares", {
                        color: (chunks) => (
                            <span className="text-red-600">{chunks}</span>
                        ),
                    })}
                </li>
            </ul>
            <p>{t("gameplay")}</p>
            <p>{t("winning")}</p>
            <TimestampHref
                href="https://www.youtube.com/live/PJtapc2_7ok?feature=shared&t=11173"
                caption={t("timestampCaption")}
                type="embed"
            />
        </div>
    );
};

export default GamblingGameInfo;
