import { CONTRIBUTORS } from "@/lib/misc";
import { useTranslations } from "next-intl";
import React from "react";

interface Contributor {
    name: string;
    socials: string | null;
}

const CreditBlock = ({
    role,
    icon,
    contributors,
}: {
    role: string;
    icon: React.JSX.Element;
    contributors: Contributor[];
}) => {
    const t = useTranslations("modals.infoCredits.roles");
    return (
        <div className="text-center sm:text-left">
            <div className="flex underline underline-offset-2 gap-2 items-center font-bold justify-center sm:justify-start">
                {icon}
                {t(role)}
            </div>
            <ul className="list-disc mt-2">
                {contributors.map((contributor, index) => (
                    <li
                        className="flex gap-2 justify-center sm:justify-start"
                        key={index}
                    >
                        {contributor.socials === null ? (
                            <span>{contributor.name}</span>
                        ) : (
                            <a
                                href={contributor.socials}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {contributor.name}
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ViewInfoCredits = () => {
    const t = useTranslations("modals.infoCredits");
    const tRoles = useTranslations("modals.infoCredits.roles");

    const archiverCredits = CONTRIBUTORS.filter(
        (credit) => credit.role === "Archive Writer",
    );
    const archiveAssistants = CONTRIBUTORS.filter(
        (credit) => credit.role === "Archive Assistant",
    );
    const otherCredits = CONTRIBUTORS.filter(
        (credit) =>
            credit.role !== "Archive Writer" &&
            credit.role !== "Archive Assistant" &&
            credit.role !== "Project Lead" &&
            credit.role !== "Main Developer" &&
            credit.role !== "Quality Assurance",
    );

    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">{t("title")}</span>
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
                {CONTRIBUTORS.filter(
                    (credit) =>
                        credit.role === "Project Lead" ||
                        credit.role === "Main Developer" ||
                        credit.role === "Quality Assurance",
                ).map((credit, index) => (
                    <CreditBlock
                        key={index}
                        role={credit.role}
                        icon={credit.icon}
                        contributors={credit.contributors}
                    />
                ))}
            </div>

            {/* Archivers */}
            <div className="grid lg:grid-cols-2 gap-4">
                <div className="flex flex-col lg:items-center gap-2">
                    <div className="flex gap-2 items-center underline underline-offset-2 font-bold justify-center sm:justify-start">
                        {archiverCredits[0].icon}
                        {tRoles(archiverCredits[0].role)}
                    </div>
                    <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4 text-center sm:text-left">
                        {archiverCredits[0].contributors.map(
                            (contributor, index) => (
                                <div
                                    className="flex gap-2 justify-center sm:justify-start"
                                    key={index}
                                >
                                    {contributor.socials === null ? (
                                        <span>{contributor.name}</span>
                                    ) : (
                                        <a
                                            href={contributor.socials}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {contributor.name}
                                        </a>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:mx-auto gap-2">
                    <div className="flex gap-2 items-center underline underline-offset-2 font-bold justify-center sm:justify-start">
                        {archiveAssistants[0].icon}
                        {tRoles(archiveAssistants[0].role)}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2 text-center sm:text-left">
                        {archiveAssistants[0].contributors.map(
                            (contributor, index) => (
                                <div
                                    className="flex gap-2 justify-center sm:justify-start"
                                    key={index}
                                >
                                    {contributor.socials === null ? (
                                        <span>{contributor.name}</span>
                                    ) : (
                                        <a
                                            href={contributor.socials}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {contributor.name}
                                        </a>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
                {otherCredits.map((credit) => (
                    <CreditBlock
                        key={credit.role}
                        role={credit.role}
                        contributors={credit.contributors}
                        icon={credit.icon}
                    />
                ))}
            </div>

            <div className="font-bold text-center sm:text-left">
                {t("specialThanks")}
            </div>

            <div className="text-center sm:text-left -mt-2">
                {t("specialThanksDiscord")}
            </div>
            <div className="text-center sm:text-left -mt-2">
                {t.rich("specialThanksLyger", {
                    link: (chunks) => (
                        <a
                            href="https://x.com/lyger_0"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {chunks}
                        </a>
                    ),
                })}
            </div>
        </div>
    );
};

export default ViewInfoCredits;
