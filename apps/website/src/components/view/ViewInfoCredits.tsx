import { CONTRIBUTORS } from "@/lib/misc";
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
    return (
        <div className="text-center sm:text-left">
            <div className="flex gap-2 items-center font-bold justify-center sm:justify-start">
                {icon}
                <span className="underline underline-offset-2">{role}</span>
            </div>
            <ul className="list-disc mt-2 text-left sm:text-left">
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
    const archiverCredits = CONTRIBUTORS.filter(
        (credit) => credit.role === "Archive Writer",
    );
    const otherCredits = CONTRIBUTORS.filter(
        (credit) => credit.role !== "Archive Writer",
    );
    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">Credits</span>
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

            <div className="flex gap-2 items-center font-bold justify-center sm:justify-start">
                {archiverCredits[0].icon}
                {archiverCredits[0].role}
            </div>
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-2 text-center sm:text-left">
                {archiverCredits[0].contributors.map((contributor, index) => (
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
                ))}
            </div>

            <div className="font-bold text-center sm:text-left">
                Special Thanks
            </div>

            <div className="text-center sm:text-left -mt-2">
                To everyone at the Enigmatic Recollection Lore Discord Server
                for providing additional resources and emotional support, as
                well as to the artists featured in the Fanart Gallery for
                granting us permission to use their work in this project. All
                artworks and their creators are properly credited and can be
                found in that section.
            </div>
        </div>
    );
};

export default ViewInfoCredits;
