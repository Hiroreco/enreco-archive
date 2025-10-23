import ViewFanartModal from "@/components/view/fanart/ViewFanartModal";
import ViewInfoModal from "@/components/view/basic-modals/ViewInfoModal";
import ViewMiniGameModal from "@/components/view/minigames/ViewMiniGameModal";
import ViewMusicPlayerModal from "@/components/view/jukebox/ViewMusicPlayerModal";
import ViewSettingsModal from "@/components/view/utility-modals/ViewSettingsModal";
import { useViewStore, ModalType } from "@/store/viewStore";
import { IconButton } from "@enreco-archive/common-ui/components/IconButton";
import { Book, Dice6, Disc3, Info, Palette, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import ViewChapterRecapModal from "../utility-modals/ViewChapterRecapModal";

interface ViewModalCollectionProps {
    modals: ModalType[];
    hideOnMobile?: ModalType[];
    alwaysVertical?: boolean;
}

const ViewModalCollection = ({
    modals,
    hideOnMobile = [],
    alwaysVertical = false,
}: ViewModalCollectionProps) => {
    const tNavTooltips = useTranslations("navTooltips");

    const openModal = useViewStore((state) => state.modal.openModal);
    const closeModal = useViewStore((state) => state.modal.closeModal);
    const chapter = useViewStore((state) => state.data.chapter);
    const day = useViewStore((state) => state.data.day);

    const openInfoModal = useViewStore((state) => state.modal.openInfoModal);
    const openSettingsModal = useViewStore(
        (state) => state.modal.openSettingsModal,
    );
    const openMinigameModal = useViewStore(
        (state) => state.modal.openMinigameModal,
    );
    const openMusicPlayerModal = useViewStore(
        (state) => state.modal.openMusicPlayerModal,
    );
    const openFanartModal = useViewStore(
        (state) => state.modal.openFanartModal,
    );
    const openChapterRecapModal = useViewStore(
        (state) => state.modal.openChapterRecapModal,
    );

    const isHiddenOnMobile = (type: ModalType) =>
        hideOnMobile.includes(type) ? "hidden md:block" : "";

    return (
        <>
            {modals.includes("info") && (
                <ViewInfoModal
                    open={openModal === "info"}
                    onClose={closeModal}
                />
            )}

            {modals.includes("settings") && (
                <ViewSettingsModal
                    open={openModal === "settings"}
                    onClose={closeModal}
                />
            )}

            {modals.includes("minigame") && (
                <ViewMiniGameModal
                    open={openModal === "minigame"}
                    onClose={closeModal}
                />
            )}

            {modals.includes("music") && (
                <ViewMusicPlayerModal
                    open={openModal === "music"}
                    onClose={closeModal}
                />
            )}

            {modals.includes("fanart") && (
                <ViewFanartModal
                    open={openModal === "fanart"}
                    onClose={closeModal}
                    chapter={chapter}
                    day={day}
                />
            )}

            {modals.includes("chapterRecap") && (
                <ViewChapterRecapModal
                    key={`chapter-recap-modal-${chapter}`}
                    open={openModal === "chapterRecap"}
                    onClose={closeModal}
                    currentChapter={chapter}
                />
            )}

            <div
                className={cn(
                    "fixed top-0 right-0 m-[8px] z-10 flex md:flex-col gap-[8px]",
                    alwaysVertical && "flex-col",
                )}
            >
                {modals.includes("info") && (
                    <IconButton
                        id="info-btn"
                        className={cn(
                            "size-[40px] p-[4px]",
                            isHiddenOnMobile("info"),
                        )}
                        tooltipText={tNavTooltips("info")}
                        enabled
                        tooltipSide="left"
                        onClick={openInfoModal}
                    >
                        <Info />
                    </IconButton>
                )}

                {modals.includes("settings") && (
                    <IconButton
                        id="settings-btn"
                        className={cn(
                            "size-[40px] p-[4px]",
                            isHiddenOnMobile("settings"),
                        )}
                        tooltipText={tNavTooltips("settings")}
                        enabled
                        tooltipSide="left"
                        onClick={openSettingsModal}
                    >
                        <Settings />
                    </IconButton>
                )}

                {modals.includes("minigame") && (
                    <IconButton
                        id="minigames-btn"
                        className={cn(
                            "size-[40px] p-[4px]",
                            isHiddenOnMobile("minigame"),
                        )}
                        tooltipText={tNavTooltips("minigames")}
                        enabled
                        tooltipSide="left"
                        onClick={openMinigameModal}
                    >
                        <Dice6 />
                    </IconButton>
                )}

                {modals.includes("music") && (
                    <IconButton
                        id="music-player-btn"
                        className={cn(
                            "size-[40px] p-[4px]",
                            isHiddenOnMobile("music"),
                        )}
                        tooltipText={tNavTooltips("jukebox")}
                        enabled
                        tooltipSide="left"
                        onClick={openMusicPlayerModal}
                    >
                        <Disc3 />
                    </IconButton>
                )}

                {modals.includes("fanart") && (
                    <IconButton
                        id="fanart-btn"
                        className={cn(
                            "size-[40px] p-1",
                            isHiddenOnMobile("fanart"),
                        )}
                        tooltipText={tNavTooltips("libestalGallery")}
                        enabled
                        tooltipSide="left"
                        onClick={openFanartModal}
                    >
                        <Palette />
                    </IconButton>
                )}

                {modals.includes("chapterRecap") && (
                    <IconButton
                        id="chapter-recap-btn"
                        className="h-10 w-10 p-1"
                        tooltipText={tNavTooltips("chapterRecap")}
                        enabled={true}
                        tooltipSide="left"
                        onClick={openChapterRecapModal}
                    >
                        <Book />
                    </IconButton>
                )}
            </div>
        </>
    );
};

export default ViewModalCollection;
