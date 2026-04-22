import useIsMobileViewport from "@/hooks/useIsMobileViewport";
import ChapterRecapModal from "./ChapterRecapModal";
import ChapterRecapModalMobile from "./ChapterRecapModalMobile";

interface ChapterRecapModalContainerProps {
    open: boolean;
    onClose: () => void;
    currentChapter: number;
}

const ChapterRecapModalContainer = ({
    open,
    onClose,
    currentChapter,
}: ChapterRecapModalContainerProps) => {
    const isMobile = useIsMobileViewport();

    if (isMobile) {
        return (
            <ChapterRecapModalMobile
                open={open}
                onClose={onClose}
                currentChapter={currentChapter}
            />
        );
    }

    return (
        <ChapterRecapModal
            open={open}
            onClose={onClose}
            currentChapter={currentChapter}
        />
    );
};

export default ChapterRecapModalContainer;
