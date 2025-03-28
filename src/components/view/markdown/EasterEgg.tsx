import ViewAmeEasterEgg from "@/components/view/easter-eggs/ViewAmeEasterEgg";
import ViewFaunaEasterEgg from "@/components/view/easter-eggs/ViewFaunaEasterEgg";
import ViewPotatoSalidEasterEgg from "@/components/view/easter-eggs/ViewPotatoSalidEasterEgg";
import ViewMoomEasterEgg from "@/components/view/ViewMoomEasterEgg";

import { ReactNode } from "react";

const EASTER_EGGS: { [key: string]: ReactNode } = {
    faunamart: <ViewFaunaEasterEgg />,
    potato: <ViewPotatoSalidEasterEgg />,
    ame: <ViewAmeEasterEgg />,
    moom: <ViewMoomEasterEgg />,
};

interface EasterEggProps {
    easterEggName: string;
}

export default function EasterEgg({ easterEggName }: EasterEggProps) {
    return <div className="easter-egg">{EASTER_EGGS[easterEggName]}</div>;
}
