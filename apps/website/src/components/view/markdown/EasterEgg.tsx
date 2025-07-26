import ViewNerissaEasterEgg from "@/components/view/easter-eggs/advent/ViewNerissaEasterEgg";
import ViewAwooEasterEgg from "@/components/view/easter-eggs/justice/ViewAwooEasterEgg";
import ViewAmeEasterEgg from "@/components/view/easter-eggs/myth/ViewAmeEasterEgg";
import ViewGuraEasterEgg from "@/components/view/easter-eggs/myth/ViewGuraEasterEgg";
import ViewFaunaEasterEgg from "@/components/view/easter-eggs/promise/ViewFaunaEasterEgg";
import ViewMoomEasterEgg from "@/components/view/easter-eggs/promise/ViewMoomEasterEgg";
import ViewPotatoSalidEasterEgg from "@/components/view/easter-eggs/ViewPotatoSalidEasterEgg";

import ViewBijouEasterEgg from "@/components/view/easter-eggs/advent/ViewBijouEasterEgg";
import ViewFuwawaEasterEgg from "@/components/view/easter-eggs/advent/ViewFuwawaEasterEgg";
import ViewMococoEasterEgg from "@/components/view/easter-eggs/advent/ViewMococoEasterEgg";
import ViewShioriEasterEgg from "@/components/view/easter-eggs/advent/ViewShioriEasterEgg";
import ViewCeciliaEasterEgg from "@/components/view/easter-eggs/justice/ViewCeciliaEasterEgg";
import ViewLizEasterEgg from "@/components/view/easter-eggs/justice/ViewLizEasterEgg";
import ViewRaoraEasterEgg from "@/components/view/easter-eggs/justice/ViewRaoraEasterEgg";
import ViewCalliEasterEgg from "@/components/view/easter-eggs/myth/ViewCalliEasterEgg";
import ViewInaEasterEgg from "@/components/view/easter-eggs/myth/ViewInaEasterEgg";
import ViewKiaraEasterEgg from "@/components/view/easter-eggs/myth/ViewKiaraEasterEgg";
import ViewBaeEasterEgg from "@/components/view/easter-eggs/promise/ViewBaeEasterEgg";
import ViewIrysEasterEgg from "@/components/view/easter-eggs/promise/ViewIrysEasterEgg";
import ViewKroniiEasterEgg from "@/components/view/easter-eggs/promise/ViewKroniiEasterEgg";
import { ReactNode } from "react";

const EASTER_EGGS: { [key: string]: ReactNode } = {
    "easter-potato": <ViewPotatoSalidEasterEgg />,
    "easter-ame": <ViewAmeEasterEgg />,
    "easter-gura": <ViewGuraEasterEgg />,
    "easter-calli": <ViewCalliEasterEgg />,
    "easter-kiara": <ViewKiaraEasterEgg />,
    "easter-ina": <ViewInaEasterEgg />,
    "easter-moom": <ViewMoomEasterEgg />,
    "easter-faunamart": <ViewFaunaEasterEgg />,
    "easter-irys": <ViewIrysEasterEgg />,
    "easter-bae": <ViewBaeEasterEgg />,
    "easter-kronii": <ViewKroniiEasterEgg />,
    "easter-nerissa": <ViewNerissaEasterEgg />,
    "easter-fuwawa": <ViewFuwawaEasterEgg />,
    "easter-mococo": <ViewMococoEasterEgg />,
    "easter-bijou": <ViewBijouEasterEgg />,
    "easter-shiori": <ViewShioriEasterEgg />,
    "easter-gigi": <ViewAwooEasterEgg />,
    "easter-liz": <ViewLizEasterEgg />,
    "easter-cecilia": <ViewCeciliaEasterEgg />,
    "easter-raora": <ViewRaoraEasterEgg />,
};

interface EasterEggProps {
    easterEggName: string;
}

export default function EasterEgg({ easterEggName }: EasterEggProps) {
    return <div className="easter-egg">{EASTER_EGGS[easterEggName]}</div>;
}
