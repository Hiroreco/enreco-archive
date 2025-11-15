import ChickenGame from "@/components/view/minigames/ChickenGame";
import ChickenGameInfo from "@/components/view/minigames/ChickenGameInfo";
import GamblingGame from "@/components/view/minigames/GamblingGame";
import GamblingGameInfo from "@/components/view/minigames/GamblingGameInfo";
import MemoryGame from "@/components/view/minigames/MemoryGame";
import MemoryGameInfo from "@/components/view/minigames/MemoryGameInfo";
import ShioriGame from "@/components/view/minigames/ShioriGame";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@enreco-archive/common-ui/components/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@enreco-archive/common-ui/components/select";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { ReactElement, useCallback, useState } from "react";

interface MiniGameModalProps {
    open: boolean;
    onClose: () => void;
}

const MiniGameModal = ({ open, onClose }: MiniGameModalProps) => {
    const t = useTranslations("modals.minigames");
    const [game, setGame] = useState("gambling");

    const GAMES: { [key: string]: { label: string; info: ReactElement } } = {
        gambling: {
            label: t("games.gambling.label"),
            info: <GamblingGameInfo />,
        },
        memory: {
            label: t("games.memory.label"),
            info: <MemoryGameInfo />,
        },
        chicken: {
            label: t("games.chicken.label"),
            info: <ChickenGameInfo />,
        },
        // shiori: {
        //     label: t("games.shiori.label"),
        //     info: <ShioriGameInfo />,
        // },
    };

    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const baseClass =
        "md:max-w-[800px] max-w-none w-[95vw] h-[80vh] transition-all";
    const defaultClass = "md:max-h-[25rem] " + baseClass;
    const chickenClass = "md:max-h-[37.5rem] " + baseClass;
    const shioriClass = "md:max-h-[37.5rem] " + baseClass;
    const modalClass = React.useMemo(() => {
        if (game === "shiori" && !isMobile) {
            return shioriClass;
        }
        if (game === "chicken" && !isMobile) {
            return chickenClass;
        }
        return defaultClass;
    }, [game, isMobile, defaultClass, chickenClass, shioriClass]);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={modalClass}
                showXButton={true}
                showXButtonForce={true}
            >
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>{t("description")}</DialogDescription>
                </VisuallyHidden>

                <div className="h-full w-full flex flex-col">
                    <Select value={game} onValueChange={setGame}>
                        <SelectTrigger className="mx-auto">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(GAMES).map((game) => {
                                return (
                                    <SelectItem key={game} value={game}>
                                        {GAMES[game].label}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    {/* Game container */}
                    <div className="flex grow items-center justify-center w-full">
                        <AnimatePresence mode="wait">
                            {[
                                {
                                    key: "gambling",
                                    component: <GamblingGame />,
                                },
                                {
                                    key: "memory",
                                    component: <MemoryGame />,
                                },
                                {
                                    key: "chicken",
                                    component: <ChickenGame />,
                                },
                                {
                                    key: "shiori",
                                    component: <ShioriGame />,
                                },
                            ]
                                .filter(({ key }) => key === game)
                                .map(({ key, component }) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full h-full flex items-center justify-center"
                                    >
                                        {component}
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>

                    <Dialog>
                        <DialogTrigger>
                            <Info className="absolute sm:bottom-4 sm:right-4 bottom-2 right-2 z-40" />
                        </DialogTrigger>
                        <DialogContent className="flex flex-col max-h-[85vh]">
                            <VisuallyHidden>
                                <DialogDescription>
                                    View information about the minigame
                                </DialogDescription>
                            </VisuallyHidden>
                            <DialogHeader>
                                <DialogTitle>{GAMES[game].label}</DialogTitle>
                            </DialogHeader>
                            <div className="overflow-auto grow pb-6 px-2">
                                {GAMES[game].info}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MiniGameModal;
