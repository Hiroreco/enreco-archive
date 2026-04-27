import { CONTRIBUTORS } from "@/lib/misc";
import { useSettingStore } from "@/store/settingStore";
import enMessages from "../../../../messages/en.json";
import jaMessages from "../../../../messages/ja.json";
import { useTranslations } from "next-intl";
import React from "react";

interface Contributor {
    name: string;
    socials: string | null;
}

type ArchiveEntries = Record<string, string>;

const ContributorLink = ({ contributor }: { contributor: Contributor }) => {
    if (contributor.socials === null) {
        return <span>{contributor.name}</span>;
    }

    return (
        <a
            href={contributor.socials}
            target="_blank"
            rel="noopener noreferrer"
        >
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
    const getArchiveEntry = (role: string, index: number) => {
        const messages = locale === "ja" ? jaMessages : enMessages;
        const entries: ArchiveEntries =
            role === "Archive Writer"
                ? messages.modals.infoCredits.archiveEntries.archiveWriter
                : messages.modals.infoCredits.archiveEntries.archiveAssistant;

        return entries[String(index)] ?? "";
    };

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
                        <div className="flex flex-col gap-3 md:grid md:grid-cols-[6rem_minmax(12rem,max-content)_10rem_minmax(0,1fr)] md:gap-x-6 md:gap-y-2 md:items-start">
                            {credit.contributors.map((contributor, index) => (
                                <div
                                    className="flex flex-col items-center text-center md:contents"
                                    key={`${credit.role}-${contributor.name}-${index}`}
                                >
                                    <div className="md:col-start-2 md:pr-2 md:text-left">
                                        <ContributorLink contributor={contributor} />
                                    </div>
                                    <div className="min-w-0 whitespace-normal break-words md:col-start-4 md:text-left">
                                        {getArchiveEntry(credit.role, index)}
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

            <div className="font-bold text-left">
                {t("specialThanks")}
            </div>

            <div className="text-left -mt-2">
                {t("specialThanksDiscord")}
            </div>
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
