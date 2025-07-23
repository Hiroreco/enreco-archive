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
import ViewChickenGameInfo from "@/components/view/minigames/ViewChickenGameInfo";
import ViewGamblingGameInfo from "@/components/view/minigames/ViewGamblingGameInfo";
import ViewMemoryGameInfo from "@/components/view/minigames/ViewMemoryGameInfo";
import ViewChickenGame from "@/components/view/minigames/ViewChickenGame";
import ViewGamblingGame from "@/components/view/minigames/ViewGamblingGame";
import ViewMemoryGame from "@/components/view/minigames/ViewMemoryGame";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Info } from "lucide-react";
import React, { ReactElement, useCallback, useState } from "react";
import ViewShioriGame from "@/components/view/minigames/ViewShioriGame";
import ViewShioriGameInfo from "@/components/view/minigames/ViewShioriGameInfo";
import { AnimatePresence, motion } from "framer-motion";

interface ViewMiniGameModalProps {
    open: boolean;
    onClose: () => void;
}

const GAMES: { [key: string]: { label: string; info: ReactElement } } = {
    gambling: {
        label: "Color Cannon (Chapter 1)",
        info: <ViewGamblingGameInfo />,
    },
    memory: {
        label: "Mind's Eye (Chapter 1)",
        info: <ViewMemoryGameInfo />,
    },
    chicken: {
        label: "Chicken Rescue (Chapter 1)",
        info: <ViewChickenGameInfo />,
    },
    shiori: {
        label: "Commission Shiori (Chapter 2)",
        info: <ViewShioriGameInfo />,
    },
};

const ViewMiniGameModal = ({ open, onClose }: ViewMiniGameModalProps) => {
    const [game, setGame] = useState("gambling");

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
                    <DialogTitle>Minigames</DialogTitle>
                </DialogHeader>

                <VisuallyHidden>
                    <DialogDescription>
                        Play minigames from the story
                    </DialogDescription>
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
                                    component: <ViewGamblingGame />,
                                },
                                {
                                    key: "memory",
                                    component: <ViewMemoryGame />,
                                },
                                {
                                    key: "chicken",
                                    component: <ViewChickenGame />,
                                },
                                {
                                    key: "shiori",
                                    component: <ViewShioriGame />,
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

export default ViewMiniGameModal;
