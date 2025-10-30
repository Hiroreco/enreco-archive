import TimestampHref from "@/components/view/markdown/TimestampHref";
import { useTranslations } from "next-intl";

const ViewShioriGameInfo = () => {
    const t = useTranslations("modals.minigames.games.shiori");

    return (
        <div className="flex flex-col gap-4">
            <p>
                {t.rich("intro", {
                    bold: (chunks) => (
                        <span className="font-bold">{chunks}</span>
                    ),
                })}
            </p>
            <p>{t("options")}</p>
            <p>{t("challenge")}</p>
            <TimestampHref
                href="https://www.youtube.com/live/gVAtGMLBJos?si=EyxaXf2cdLNBNqxy&t=1107"
                caption={t("timestampCaption")}
                type="embed"
            />
        </div>
    );
};

export default ViewShioriGameInfo;
