import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ViewChickenGameInfo from "@/components/view/minigames-info/ViewChickenGameInfo";
import ViewGamblingGameInfo from "@/components/view/minigames-info/ViewGamblingGameInfo";
import ViewMemoryGameInfo from "@/components/view/minigames-info/ViewMemoryGameInfo";
import ViewChickenGame from "@/components/view/ViewChickenGame";
import ViewGamblingGame from "@/components/view/ViewGamblingGame";
import ViewMemoryGame from "@/components/view/ViewMemoryGame";
import { Info } from "lucide-react";
import { ReactElement, useState } from "react";

interface ViewMiniGameModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const GAMES: { [key: string]: { label: string; info: ReactElement } } = {
    gambling: {
        label: "Gambling Game (Chapter 1)",
        info: <ViewGamblingGameInfo />,
    },
    memory: {
        label: "Memory Game (Chapter 1)",
        info: <ViewMemoryGameInfo />,
    },
    chicken: {
        label: "Chicken Game (Chapter 1)",
        info: <ViewChickenGameInfo />,
    },
};

const ViewMiniGameModal = ({ open, onOpenChange }: ViewMiniGameModalProps) => {
    const [game, setGame] = useState("gambling");
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-[800px] md:max-h-[400px] max-w-none w-[95vw] h-[80vh] transition-all">
                <DialogHeader>
                    <DialogTitle>Minigames</DialogTitle>
                </DialogHeader>

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
                    <Dialog>
                        <DialogTrigger>
                            <Info className="absolute bottom-4 right-4" />
                        </DialogTrigger>
                        <DialogContent className="flex flex-col max-h-[85vh]">
                            <DialogHeader>
                                <DialogTitle>{GAMES[game].label}</DialogTitle>
                            </DialogHeader>
                            <div className="overflow-auto grow pb-6">
                                {GAMES[game].info}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Game container */}
                    <div className="flex grow items-center justify-center w-full">
                        {game === "gambling" && <ViewGamblingGame />}
                        {game === "memory" && <ViewMemoryGame />}
                        {game === "chicken" && <ViewChickenGame />}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewMiniGameModal;
