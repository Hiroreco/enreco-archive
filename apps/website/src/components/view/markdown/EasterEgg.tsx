import ViewAmeEasterEgg from "@/components/view/easter-eggs/ViewAmeEasterEgg";
import ViewFaunaEasterEgg from "@/components/view/easter-eggs/ViewFaunaEasterEgg";
import ViewPotatoSalidEasterEgg from "@/components/view/easter-eggs/ViewPotatoSalidEasterEgg";
import ViewAwooEasterEgg from "@/components/view/ViewAwooEasterEgg";
import ViewGuraEasterEgg from "@/components/view/ViewGuraEasterEgg";
import ViewMoomEasterEgg from "@/components/view/ViewMoomEasterEgg";
import ViewNerissaEasterEgg from "@/components/view/ViewNerissaEasterEgg";

import { ReactNode } from "react";

const EASTER_EGGS: { [key: string]: ReactNode } = {
    "easter-faunamart": <ViewFaunaEasterEgg />,
    "easter-potato": <ViewPotatoSalidEasterEgg />,
    "easter-ame": <ViewAmeEasterEgg />,
    "easter-moom": <ViewMoomEasterEgg />,
    "easter-gura": <ViewGuraEasterEgg />,
    "easter-awoo": <ViewAwooEasterEgg />,
    "easter-nerissa": <ViewNerissaEasterEgg />,
};

interface EasterEggProps {
    easterEggName: string;
}

export default function EasterEgg({ easterEggName }: EasterEggProps) {
    return <div className="easter-egg">{EASTER_EGGS[easterEggName]}</div>;
}
