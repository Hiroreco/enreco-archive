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
import ViewChickenGameInfo from "@/components/view/minigames-info/ViewChickenGameInfo";
import ViewGamblingGameInfo from "@/components/view/minigames-info/ViewGamblingGameInfo";
import ViewMemoryGameInfo from "@/components/view/minigames-info/ViewMemoryGameInfo";
import ViewChickenGame from "@/components/view/ViewChickenGame";
import ViewGamblingGame from "@/components/view/ViewGamblingGame";
import ViewMemoryGame from "@/components/view/ViewMemoryGame";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Info } from "lucide-react";
import { ReactElement, useState } from "react";
import ViewShioriGame from "@/components/view/ViewShioriGame";
import ViewShioriGameInfo from "@/components/view/minigames-info/ViewShioriGameInfo";

interface ViewMiniGameModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

const ViewMiniGameModal = ({ open, onOpenChange }: ViewMiniGameModalProps) => {
    const [game, setGame] = useState("gambling");
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="md:max-w-[800px] md:max-h-[400px] max-w-none w-[95vw] h-[80vh] transition-all"
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
                    <Select
                        value={game}
                        onValueChange={(value) => setGame(value)}
                    >
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
                        {game === "gambling" && <ViewGamblingGame />}
                        {game === "memory" && <ViewMemoryGame />}
                        {game === "chicken" && <ViewChickenGame />}
                        {game === "shiori" && <ViewShioriGame />}
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
