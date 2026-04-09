import { useTranslations } from "next-intl";
import React from "react";

const BingoGameInfo = () => {
    const t = useTranslations("modals.minigames.games.bingo");

    return (
        <div className="flex flex-col gap-4">
            <p>
                {t.rich("intro", {
                    bold: (chunks) => <strong>{chunks}</strong>,
                })}
            </p>
            <p>{t("howToUse")}</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>
                    {t.rich("editModeDesc", {
                        bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                </li>
                <li>
                    {t.rich("markModeDesc", {
                        bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                </li>
                <li>
                    {t.rich("downloadDesc", {
                        bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                </li>
                <li>
                    {t.rich("presetDesc", {
                        bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                </li>
                <li>
                    {t.rich("shareDesc", {
                        bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                </li>
                <li>
                    {t.rich("cardByDay", {
                        bold: (chunks) => <strong>{chunks}</strong>,
                    })}
                </li>
            </ul>
            <p>{t("tips")}</p>
        </div>
    );
};

export default BingoGameInfo;
