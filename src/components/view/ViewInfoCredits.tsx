import { CONTRIBUTORS } from "@/lib/misc";

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
    icon: JSX.Element;
    contributors: Contributor[];
}) => {
    return (
        <div>
            <div className="flex gap-2 items-center font-bold">
                {icon}
                {role}
            </div>
            <ul className="list-disc mt-2">
                {contributors.map((contributor, index) => (
                    <li className="flex gap-2" key={index}>
                        {contributor.socials === null ? (
                            <span>{contributor.name}</span>
                        ) : (
                            <a href={contributor.socials} target="_blank">
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
        (credit) => credit.role === "Archiver",
    );
    const otherCredits = CONTRIBUTORS.filter(
        (credit) => credit.role !== "Archiver",
    );
    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">Credits</span>
            <div className="grid lg:grid-cols-3 sm:grid-cols-2">
                {otherCredits.map((credit) => (
                    <CreditBlock
                        key={credit.role}
                        role={credit.role}
                        contributors={credit.contributors}
                        icon={credit.icon}
                    />
                ))}
            </div>

            <div className="flex gap-2 items-center font-bold">
                {archiverCredits[0].icon}
                {archiverCredits[0].role}
            </div>
            <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-2">
                {archiverCredits[0].contributors.map((contributor, index) => (
                    <div className="flex gap-2" key={index}>
                        {contributor.socials === null ? (
                            <span>{contributor.name}</span>
                        ) : (
                            <a href={contributor.socials} target="_blank">
                                {contributor.name}
                            </a>
                        )}
                    </div>
                ))}
            </div>

            <div className="font-bold ">Special Thanks</div>

            <div>
                To everyone at the Enigmatic Recollection Lore Discord Server
                for providing additional resources as well as emotional support.
            </div>
        </div>
    );
};

export default ViewInfoCredits;
