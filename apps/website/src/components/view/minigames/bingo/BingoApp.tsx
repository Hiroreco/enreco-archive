import BingoGame from "@/components/view/minigames/bingo/BingoGame";
import BingoGameInfo from "@/components/view/minigames/bingo/BingoGameInfo";
import ModalCollection from "@/components/view/basic-modals/ModalCollection";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

const BingoApp = () => {
    const t = useTranslations("modals.minigames.games.bingo");

    return (
        <div className="w-screen flex flex-col items-center justify-center overflow-hidden h-dvh">
            <div className="relative px-4 flex w-full max-w-4xl flex-col bg-background/60 backdrop-blur-2xl md:rounded-lg p-4">
                <div className="pb-2 text-center">
                    <h2 className="text-lg font-semibold">{t("label")}</h2>
                    <p className="text-sm text-muted-foreground">{t("desc")}</p>
                </div>

                <div className="flex-1 min-h-0 flex items-center justify-center overflow-y-auto pb-2">
                    <BingoGame />
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            className="absolute bottom-2 right-2 z-40"
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
