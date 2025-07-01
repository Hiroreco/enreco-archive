import ViewAmeEasterEgg from "@/components/view/easter-eggs/ViewAmeEasterEgg";
import ViewFaunaEasterEgg from "@/components/view/easter-eggs/ViewFaunaEasterEgg";
import ViewPotatoSalidEasterEgg from "@/components/view/easter-eggs/ViewPotatoSalidEasterEgg";
import ViewAwooEasterEgg from "@/components/view/easter-eggs/ViewAwooEasterEgg";
import ViewGuraEasterEgg from "@/components/view/easter-eggs/ViewGuraEasterEgg";
import ViewMoomEasterEgg from "@/components/view/easter-eggs/ViewMoomEasterEgg";
import ViewNerissaEasterEgg from "@/components/view/easter-eggs/ViewNerissaEasterEgg";

import { ReactNode } from "react";
import ViewLizEasterEgg from "@/components/view/easter-eggs/ViewLizEasterEgg";

const EASTER_EGGS: { [key: string]: ReactNode } = {
    "easter-faunamart": <ViewFaunaEasterEgg />,
    "easter-potato": <ViewPotatoSalidEasterEgg />,
    "easter-ame": <ViewAmeEasterEgg />,
    "easter-moom": <ViewMoomEasterEgg />,
    "easter-gura": <ViewGuraEasterEgg />,
    "easter-gigi": <ViewAwooEasterEgg />,
    "easter-nerissa": <ViewNerissaEasterEgg />,
    "easter-liz": <ViewLizEasterEgg />,
};

interface EasterEggProps {
    easterEggName: string;
}

export default function EasterEgg({ easterEggName }: EasterEggProps) {
    return <div className="easter-egg">{EASTER_EGGS[easterEggName]}</div>;
}
