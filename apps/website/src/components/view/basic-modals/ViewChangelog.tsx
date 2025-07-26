import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@enreco-archive/common-ui/components/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback } from "react";

interface ViewChangelogModalProps {
    open: boolean;
    onClose: () => void;
}

const ViewChangelogModal = ({ open, onClose }: ViewChangelogModalProps) => {
    const onOpenChange = useCallback(
        (open: boolean) => {
            if (!open) {
                onClose();
            }
        },
        [onClose],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <VisuallyHidden>
                <DialogTitle>Changelog</DialogTitle>
            </VisuallyHidden>
            <DialogContent
                showXButton={false}
                className="rounded-lg h-[85vh] max-h-none max-w-[600px] md:w-[80vw] flex flex-col justify-end"
            >
                <VisuallyHidden>
                    <DialogDescription>
                        View the changelog for the ENreco Archive
                    </DialogDescription>
                </VisuallyHidden>

                <div className="flex-1 min-h-0 overflow-auto border-y border-foreground/60 pb-4 px-2">
                    <div className="flex flex-col gap-6 mt-4">
                        <div className="text-center">
                            <h2 className="font-bold text-2xl mb-2">
                                Changelog
                            </h2>
                            <p className="text-sm text-foreground/70">
                                Recent updates and changes to the ENreco Archive
                            </p>
                        </div>

                        {/* July 26th Update */}
                        <div className="border-l-4 border-orange-500 pl-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg">
                                    Post Chapter 2 Update
                                </span>
                                <span className="text-sm text-foreground/70 bg-accent px-2 py-1 rounded">
                                    July 26, 2025
                                </span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>
                                    Added comprehensive glossary
                                    <ul className="list-disc list-inside ml-8 mt-1 space-y-1 text-foreground/85">
                                        <li>
                                            Multi-category organization:
                                            Characters (Heroes, NPCs), Lore
                                            (General, Heroes' Storylines),
                                            Weapons (Revelations), Quests (Main
                                            Quests, Special Quests),
                                            Miscellaneous (Mechanics, Side
                                            Quests)
                                        </li>
                                        <li>
                                            Interactive 3D model viewer with
                                            orbital controls
                                        </li>
                                        <li>
                                            Chapter-based filtering and
                                            navigation
                                        </li>
                                        <li>Image gallery</li>
                                        <li>
                                            Section jumper for long content
                                            navigation
                                        </li>
                                        <li>
                                            Navigation history with back/forward
                                            buttons
                                        </li>
                                        <li>
                                            Character quotes and "First
                                            Appeared" data
                                        </li>
                                        <li>
                                            Cross-reference linking between
                                            entries
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    Introduced music player/jukebox with ENreco
                                    soundtrack
                                    <ul className="list-disc list-inside ml-8 mt-1 space-y-1 text-foreground/85">
                                        <li>
                                            Categorized playlist (Official
                                            Themes, In-Game Music, Talent-used
                                            Music, Hero Themes, Special Music)
                                        </li>
                                        <li>
                                            Shuffle and repeat modes (single
                                            track and category)
                                        </li>
                                        <li>
                                            Volume control with mute/unmute
                                            functionality
                                        </li>
                                        <li>Keyboard shortcuts</li>
                                        <li>
                                            Direct links to original song
                                            sources
                                        </li>
                                        <li>
                                            Album cover display with hover
                                            play/pause
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    Implemented fanart gallery
                                    <ul className="list-disc list-inside ml-8 mt-1 space-y-1 text-foreground/85">
                                        <li>
                                            Advanced character filtering with
                                            inclusive modes
                                        </li>
                                        <li>
                                            Chapter and day-based filtering
                                            system
                                        </li>
                                        <li>Keyboard shortcuts</li>
                                        <li>Shuffle option</li>
                                        <li>Mobile swiping</li>
                                        <li>
                                            Collapsible header with scroll-based
                                            auto-hide
                                        </li>
                                        <li>
                                            Direct links to original artist
                                            posts
                                        </li>
                                        <li>
                                            Meme filtering and categorization
                                        </li>
                                        <li>Videos-only filter option</li>
                                    </ul>
                                </li>
                                <li>Upgraded read status</li>
                                <li>
                                    Relationship thumbnails that open related
                                    cards when clicked
                                </li>
                                <li>Updated icons</li>
                                <li>New loading animation</li>
                                <li>Improved tooltips</li>
                                <li>Added more books, fanfics, and letters</li>
                                <li>Added specialized daily lore nodes</li>
                                <li>Typos and other grammar fixes</li>
                                <li>Added interactive easter eggs</li>
                                <li>Implemented audio for some texts</li>
                                <li>Added changelog</li>
                                <li>
                                    Improved navigation experience and
                                    performance optimizations
                                </li>
                            </ul>
                        </div>

                        {/* June 10th Update */}
                        <div className="border-l-4 border-green-500 pl-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg">
                                    Chapter 2 Patch
                                </span>
                                <span className="text-sm text-foreground/70 bg-accent px-2 py-1 rounded">
                                    July 10, 2025
                                </span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Updated chapter one recaps</li>
                                <li>Updated chapter two recaps</li>
                                <li>Added chapter recaps</li>
                                <li>Added books/journals</li>
                                <li>Added Comission Shiori Minigame</li>
                            </ul>
                        </div>

                        <div className="text-center text-sm text-foreground/60 mt-8">
                            <p>
                                For questions or to report issues, contact{" "}
                                <a
                                    href="https://x.com/hiroavrs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 underline"
                                >
                                    @hiroavrs
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-end w-full">
                    <DialogClose asChild>
                        <Button className="self-end">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewChangelogModal;
