import { useEffect } from "react";

interface UseEscapeCardProps {
    isCardOpen: boolean;
    onCardClose: () => void;
}

export const useEscapeCard = ({
    isCardOpen,
    onCardClose,
}: UseEscapeCardProps) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isCardOpen) {
                onCardClose();
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isCardOpen, onCardClose]);
};
