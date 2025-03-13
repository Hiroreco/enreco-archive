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

const ViewInfoGeneral = () => {
    return (
        <div className="flex flex-col gap-4">
            <span className="font-bold text-3xl mt-4">ENreco Archive</span>
            <div>
                Welcome to ENreco Archive! A fan project dedicated to archiving
                (almost) everything that transpired during the events of{" "}
                <span className="italic">Enigmatic Recollection</span>.
            </div>

            <div>
                From daily recaps and character relationships to major
                storylines that shaped the entire narrative, everything is
                compiled into byte-sized cards with timestamps—perfect for those
                looking to catch up on the series or simply relive their
                favorite moments.
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                What is Enigmatic Recollection?
            </div>

            <div>
                Enigmatic Recollection, or <strong>ENreco</strong> for short,
                is:
            </div>
            <blockquote className="pl-4 italic opacity-80">
                "A collection of stories in which the members of hololive
                English play a part. Through streams, animations, and songs
                wrought anew, immerse yourself in fresh narratives woven from
                myriad realms beyond."{" "}
                <a
                    href="https://hololive.hololivepro.com/en/news/20240823-01-97/"
                    target="_blank"
                >
                    (Source)
                </a>
            </blockquote>

            <div>
                In short, ENreco is where our favorite Hololive English talents
                come together, interact, and create stories through roleplay.
                The series is split into different chapters, each focusing on a
                specific Hololive English generation, with its own unique
                setting and lore.
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                Notes
            </div>
            <div>
                Since this project aims to provide a concise recap of the
                stories, some details may be missed or not included. For the
                full experience, you can:
                <ul className="list-disc mt-4">
                    <li>Watch the talents' streams directly</li>
                    <li>
                        Check out clips and well-made episodic compilations,
                        such as those by{" "}
                        <a
                            href="https://www.youtube.com/watch?v=KIbQ-tcNWDw&list=PLonYStlm50KZ_rKewRuHUfuEMYbk_hbsi&ab_channel=BoubonClipperCh."
                            target="_blank"
                        >
                            Boubon Clipper Ch.
                        </a>
                    </li>
                </ul>
            </div>

            <div>
                The site is constantly updating as new stories unfold, and we'd
                gladly welcome any help along the way! If you have any questions
                or are interested in joining the team, feel free to reach out to
                Hiro via{" "}
                <a href="https://x.com/hiroavrs" target="_blank">
                    X/Twitter
                </a>{" "}
                or send an email to{" "}
                <a href="mailto:hiroreco@gmail.com">
                    contacthiroreco@gmail.com
                </a>
                .
            </div>

            <div>
                With that out of the way, feel free to move on to the next
                section to learn how to navigate the archive!
            </div>

            <div className="font-bold underline underline-offset-2 text-xl">
                Credits
            </div>

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

            <div className="font-bold underline underline-offset-2 text-xl">
                Guidelines
            </div>
            <div>
                This is a non-profit fan project and is not affiliated with
                Cover Corp nor Mojang. The site uses music taken from the
                talents' streams, as well as sound effects and assets from
                Minecraft, following{" "}
                <a
                    href="https://www.minecraft.net/en-us/usage-guidelines"
                    target="_blank"
                >
                    Minecraft Usage Guidlines.
                </a>
            </div>
        </div>
    );
};

export default ViewInfoGeneral;
