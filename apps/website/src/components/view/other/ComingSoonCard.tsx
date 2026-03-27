import { useTranslations } from "next-intl";
import React from "react";

const ComingSoonCard = () => {
    const t = useTranslations("comingSoonCard");
    return (
        <div className="rounded-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/90 border border-border shadow-lg p-8 text-center text-foreground z-10">
            <p>
                {t.rich("text1", {
                    bold: (chunks) => <strong>{chunks}</strong>,
                })}
            </p>
            <p>
                {t.rich("text2", {
                    link: (chunks) => (
                        <a
                            href="https://twitter.com/hiroavrs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2"
                        >
                            {chunks}
                        </a>
                    ),
                })}
            </p>
        </div>
    );
};

export default ComingSoonCard;
