import { Contributor, CONTRIBUTORS } from "@/lib/misc";
import { useSettingStore } from "@/store/settingStore";
import { useTranslations } from "next-intl";
import React from "react";

type ArchiveEntries = Record<string, string>;

const ContributorLink = ({ contributor }: { contributor: Contributor }) => {
    if (contributor.socials === null) {
        return <span>{contributor.name}</span>;
    }

    return (
        <a href={contributor.socials} target="_blank" rel="noopener noreferrer">
            {contributor.name}
        </a>
    );
};

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
        <div className="text-center">
            <div className="flex underline underline-offset-2 gap-2 items-center font-bold justify-center">
                {icon}
                {t(role)}
            </div>
            <ul className="list-disc mt-2">
                {contributors.map((contributor, index) => (
                    <li className="flex gap-2 justify-center" key={index}>
                        <ContributorLink contributor={contributor} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

const InfoCredits = () => {
    const t = useTranslations("modals.infoCredits");
    const tRoles = useTranslations("modals.infoCredits.roles");
    const locale = useSettingStore((state) => state.locale);

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
        <div className="flex flex-col gap-4 text-center">
            <span className="font-bold text-3xl mt-4">{t("title")}</span>
            <div className="flex flex-col gap-4">
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
            <div className="grid grid-cols-1 gap-6">
                {[archiverCredits[0], archiveAssistants[0]].map((credit) => (
                    <div className="flex flex-col gap-2" key={credit.role}>
                        <div className="flex gap-2 items-center underline underline-offset-2 font-bold justify-center">
                            {credit.icon}
                            {tRoles(credit.role)}
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-x-6 gap-y-4">
                            {credit.contributors.map((contributor, index) => (
                                <div
                                    className="flex flex-col items-center text-center"
                                    key={`${credit.role}-${contributor.name}-${index}`}
                                >
                                    <ContributorLink
                                        contributor={contributor}
                                    />
                                    <div className="leading-relaxed text-sm text-muted-foreground">
                                        {contributor.credits
                                            ? contributor.credits[locale]?.map(
                                                  (credit, idx) => (
                                                      <div key={idx}>
                                                          {credit}
                                                      </div>
                                                  ),
                                              )
                                            : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                {otherCredits.map((credit) => (
                    <CreditBlock
                        key={credit.role}
                        role={credit.role}
                        contributors={credit.contributors}
                        icon={credit.icon}
                    />
                ))}
            </div>

            <div className="font-bold text-left">{t("specialThanks")}</div>

            <div className="text-left -mt-2">{t("specialThanksDiscord")}</div>
            <div className="text-left -mt-2">
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

export default InfoCredits;
