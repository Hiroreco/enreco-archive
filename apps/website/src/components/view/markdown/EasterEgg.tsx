import NerissaEasterEgg from "@/components/view/easter-eggs/advent/NerissaEasterEgg";
import AwooEasterEgg from "@/components/view/easter-eggs/justice/AwooEasterEgg";
import AmeEasterEgg from "@/components/view/easter-eggs/myth/AmeEasterEgg";
import GuraEasterEgg from "@/components/view/easter-eggs/myth/GuraEasterEgg";
import FaunaEasterEgg from "@/components/view/easter-eggs/promise/FaunaEasterEgg";
import MoomEasterEgg from "@/components/view/easter-eggs/promise/MoomEasterEgg";
import PotatoSalidEasterEgg from "@/components/view/easter-eggs/PotatoSalidEasterEgg";

import BijouEasterEgg from "@/components/view/easter-eggs/advent/BijouEasterEgg";
import FuwawaEasterEgg from "@/components/view/easter-eggs/advent/FuwawaEasterEgg";
import MococoEasterEgg from "@/components/view/easter-eggs/advent/MococoEasterEgg";
import ShioriEasterEgg from "@/components/view/easter-eggs/advent/ShioriEasterEgg";
import CeciliaEasterEgg from "@/components/view/easter-eggs/justice/CeciliaEasterEgg";
import LizEasterEgg from "@/components/view/easter-eggs/justice/LizEasterEgg";
import RaoraEasterEgg from "@/components/view/easter-eggs/justice/RaoraEasterEgg";
import CalliEasterEgg from "@/components/view/easter-eggs/myth/CalliEasterEgg";
import InaEasterEgg from "@/components/view/easter-eggs/myth/InaEasterEgg";
import KiaraEasterEgg from "@/components/view/easter-eggs/myth/KiaraEasterEgg";
import BaeEasterEgg from "@/components/view/easter-eggs/promise/BaeEasterEgg";
import IrysEasterEgg from "@/components/view/easter-eggs/promise/IrysEasterEgg";
import KroniiEasterEgg from "@/components/view/easter-eggs/promise/KroniiEasterEgg";
import { ReactNode } from "react";

const EASTER_EGGS: { [key: string]: ReactNode } = {
    "easter-potato": <PotatoSalidEasterEgg />,
    "easter-ame": <AmeEasterEgg />,
    "easter-gura": <GuraEasterEgg />,
    "easter-calli": <CalliEasterEgg />,
    "easter-kiara": <KiaraEasterEgg />,
    "easter-ina": <InaEasterEgg />,
    "easter-moom": <MoomEasterEgg />,
    "easter-faunamart": <FaunaEasterEgg />,
    "easter-irys": <IrysEasterEgg />,
    "easter-bae": <BaeEasterEgg />,
    "easter-kronii": <KroniiEasterEgg />,
    "easter-nerissa": <NerissaEasterEgg />,
    "easter-fuwawa": <FuwawaEasterEgg />,
    "easter-mococo": <MococoEasterEgg />,
    "easter-bijou": <BijouEasterEgg />,
    "easter-shiori": <ShioriEasterEgg />,
    "easter-gigi": <AwooEasterEgg />,
    "easter-liz": <LizEasterEgg />,
    "easter-cecilia": <CeciliaEasterEgg />,
    "easter-raora": <RaoraEasterEgg />,
};

interface EasterEggProps {
    easterEggName: string;
}

export default function EasterEgg({ easterEggName }: EasterEggProps) {
    return <div className="easter-egg">{EASTER_EGGS[easterEggName]}</div>;
}
