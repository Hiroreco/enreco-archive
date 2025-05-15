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
    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">Credits</span>

            {/* center */}
            <div className="grid lg:grid-cols-3 md:grid-cols-2">
                {CONTRIBUTORS.map((credit) => (
                    <CreditBlock
                        key={credit.role}
                        role={credit.role}
                        contributors={credit.contributors}
                        icon={credit.icon}
                    />
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
