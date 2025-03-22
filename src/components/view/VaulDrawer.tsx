import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/useMounted";
import useScreenWidthChangeListener from "@/hooks/useScreenWidthChangeListener";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { debounce } from "lodash";
import { useCallback, useMemo, useRef, useState } from "react";
import { Drawer } from "vaul";

const MOBILE_SNAP_POINTS: number[] = [0.5, 1];
const DESKTOP_SNAP_POINTS: number[] = [1];
const DRAWER_CONTENT_CLASSES =
    "z-40 rounded-t-xl fixed outline-none overflow-hidden bg-card text-card-foreground card-deco " +
    "h-[90%] bottom-0 left-0 right-0 " +
    "md:w-[40%] md:h-[94%] md:bottom-[3%] md:top-[3%] md:left-auto md:right-14 md:rounded-xl " +
    "shadow-2xl";

export const DRAWER_OPEN_CLOSE_ANIM_TIME_MS = 500;

interface VaulDrawerProps {
    open: boolean;
    disableScrollablity: boolean;
    onOpenChange: (open: boolean) => void;
    onOpenFullyChange?: (open: boolean) => void;
    onWidthChange?: (width: number) => void;
    onOpenAnimationEnd?: () => void;
    onCloseAnimationEnd?: () => void;
    children?: React.ReactNode;
}

export default function VaulDrawer({
    open,
    onOpenChange,
    onOpenFullyChange,
    onWidthChange,
    onOpenAnimationEnd,
    onCloseAnimationEnd,
    disableScrollablity,
    children,
}: VaulDrawerProps) {
    const { screenWidth } = useScreenWidthChangeListener();
    const [isScrollable, setIsScrollable] = useState(true);
    const contentDivWidth = useRef<number>(0);
    const isOnClient = useMounted();

    const debouncedOnCloseAnimationEnd = debounce(
        () => onCloseAnimationEnd?.(),
        300,
    );
    const debouncedOnOpenAnimationEnd = debounce(
        () => onOpenAnimationEnd?.(),
        300,
    );

    const reportContentWidth = useCallback(
        (contentNode: HTMLDivElement) => {
            if (!contentNode) {
                return;
            }

            //Round off decimal portion.
            const newContentDivWidth = Math.round(
                contentNode.getBoundingClientRect().width,
            );
            if (contentDivWidth.current !== newContentDivWidth) {
                onWidthChange?.(newContentDivWidth);
                contentDivWidth.current = newContentDivWidth;
            }

            const animEndListener = (event: AnimationEvent) => {
                if (
                    event.animationName === "slideToRight" ||
                    event.animationName === "slideToBottom"
                ) {
                    debouncedOnCloseAnimationEnd();
                    contentDivWidth.current = 0;
                } else if (
                    event.animationName === "slideFromRight" ||
                    event.animationName === "slideFromBottom"
                ) {
                    debouncedOnOpenAnimationEnd();
                }
            };

            const transitionEndListener = (event: TransitionEvent) => {
                if (
                    event.propertyName === "transform" &&
                    event.target === contentNode &&
                    contentNode.dataset.state === "open"
                ) {
                    debouncedOnOpenAnimationEnd();
                } else if (
                    event.propertyName === "transform" &&
                    event.target === contentNode &&
                    contentNode.dataset.state === "closed"
                ) {
                    debouncedOnCloseAnimationEnd();
                    contentDivWidth.current = 0;
                }
            };

            contentNode.addEventListener("animationend", animEndListener);
            contentNode.addEventListener(
                "transitionend",
                transitionEndListener,
            );

            return () => {
                contentNode.removeEventListener(
                    "animationend",
                    animEndListener,
                );
                contentNode.removeEventListener(
                    "transitionend",
                    transitionEndListener,
                );
            };
        },
        [
            debouncedOnCloseAnimationEnd,
            debouncedOnOpenAnimationEnd,
            onWidthChange,
        ],
    );

    function onDrawerClose() {
        contentDivWidth.current = 0;
        onOpenChange(false);
    }

    const isMobile = screenWidth <= 768;

    const drawerDir = useMemo(
        () => (isMobile ? "bottom" : "right"),
        [isMobile],
    );

    // Don't render anything if we're not the browser, helps avoid the dreaded hydration error.
    if (!isOnClient) {
        return null;
    }

    return (
        <Drawer.Root
            open={open}
            onOpenChange={onOpenChange}
            modal={isMobile}
            direction={drawerDir}
            dismissible={true}
            snapPoints={isMobile ? MOBILE_SNAP_POINTS : DESKTOP_SNAP_POINTS}
            setActiveSnapPoint={(index) => {
                if (index === 1) {
                    setIsScrollable(true);
                    onOpenFullyChange?.(true);
                }
                if (index === 0.5) {
                    setIsScrollable(false);
                    onOpenFullyChange?.(false);
                }
            }}
            snapToSequentialPoint
            fadeFromIndex={0}
            handleOnly={!isMobile}
        >
            <Drawer.Portal>
                {/* Calling this conditionally because it causes crash in dev mode when you resize the viewport for some reason */}
                {isMobile && (
                    <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                )}

                <Drawer.Content
                    className={DRAWER_CONTENT_CLASSES}
                    ref={reportContentWidth}
                    style={
                        isMobile
                            ? {}
                            : ({
                                  "--initial-transform": "calc(100% + 3.5rem)",
                              } as React.CSSProperties)
                    }
                >
                    <VisuallyHidden>
                        <Drawer.Title>Vaul Drawer</Drawer.Title>
                    </VisuallyHidden>

                    <VisuallyHidden>
                        <Drawer.Description>Card Content</Drawer.Description>
                    </VisuallyHidden>

                    <div className="flex flex-col h-full max-h-full">
                        <div className="flex-initial block md:hidden bg-foreground opacity-75 w-2/4 min-h-2 h-2 mx-auto my-4 rounded-full" />
                        <div className="flex-initial md:block hidden w-2/4 min-h-2 h-2 mx-auto my-2" />
                        <div
                            className={cn(
                                "flex-1 p-4 pt-0 max-h-full overflow-hidden",
                                {
                                    "pointer-events-auto":
                                        isScrollable && !disableScrollablity,
                                    "pointer-events-none":
                                        (!isScrollable ||
                                            disableScrollablity) &&
                                        isMobile,
                                },
                            )}
                        >
                            {children}
                        </div>

                        {!isMobile && (
                            <div className="flex-[0_1_3rem] px-4 pb-4">
                                <Button
                                    className="bg-accent text-accent-foreground w-full"
                                    onClick={onDrawerClose}
                                >
                                    <span className="text-lg">Close</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
