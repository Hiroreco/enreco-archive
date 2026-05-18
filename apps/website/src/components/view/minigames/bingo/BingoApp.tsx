import BingoGame from "@/components/view/minigames/bingo/BingoGame";
import BingoGameInfo from "@/components/view/minigames/bingo/BingoGameInfo";
import ModalCollection from "@/components/view/basic-modals/ModalCollection";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@enreco-archive/common-ui/components/button";
import Image from "next/image";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { useAudioStore } from "@/store/audioStore";
import { useEffect } from "react";

const BingoApp = () => {
    const t = useTranslations("modals.minigames.games.bingo");
    const tCommon = useTranslations("common");

    const {
        playEasterEgg,
        initializeEasterEgg,
        cleanupEasterEgg,
        easterEggStates,
    } = useAudioStore();
    const eggName = "nerissa";
    const eggState = easterEggStates[eggName];
    const isPlaying = eggState?.isPlaying || false;

    useEffect(() => {
        initializeEasterEgg(eggName);

        return () => {
            cleanupEasterEgg(eggName);
        };
    }, [eggName, initializeEasterEgg, cleanupEasterEgg]);

    const handleClick = () => {
        if (!isPlaying) {
            playEasterEgg(eggName);
        }
    };

    return (
        <div className="w-screen flex flex-col items-center justify-center overflow-hidden h-dvh">
            <div className="relative px-4 flex flex-col justify-center w-full md:h-auto h-full max-w-4xl bg-background/60 backdrop-blur-2xl md:rounded-lg p-4 md:pt-4 pt-14">
                <div className="pb-2 text-center md:block hidden">
                    <h2 className="text-lg font-semibold">{t("label")}</h2>
                    <p className="text-sm text-muted-foreground">{t("desc")}</p>
                </div>

                <div className="absolute md:top-0 bottom-10 md:right-4 right-0 h-[120px] overflow-hidden rotate-270 md:rotate-x-180">
                    <Image
                        width={100}
                        height={100}
                        src="images-opt/easter-nerissa-opt.webp"
                        draggable={false}
                        className={cn(
                            "mx-auto opacity-50 translate-y-[50%] transition-opacity",
                            {
                                "cursor-pointer opacity-50 hover:opacity-80":
                                    !isPlaying,
                                "opacity-80": isPlaying,
                            },
                        )}
                        onClick={handleClick}
                        alt=""
                        priority={true}
                    />
                </div>

                <BingoGame />

                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            className="absolute md:bottom-2 md:right-2 bottom-4 right-4 z-40"
                            aria-label={t("label")}
                            type="button"
                        >
                            <Info />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="flex flex-col max-h-[85vh]">
                        <VisuallyHidden>
                            <DialogDescription>
                                View information about the bingo game
                            </DialogDescription>
                        </VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>{t("label")}</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-auto grow pb-6 px-2">
                            <BingoGameInfo />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button>{tCommon("close")}</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <ModalCollection
                modals={["fanart", "settings", "minigame", "music", "info"]}
                hideOnMobile={["minigame", "info"]}
            />
        </div>
    );
};

export default BingoApp;
