import { Button } from "@enreco-archive/common-ui/components/button";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@enreco-archive/common-ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
    useState,
    AnimationEvent,
    ReactNode,
    TransitionEvent,
    CSSProperties,
} from "react";
import { Drawer } from "vaul";
import { useTranslations } from "next-intl";
import useIsMobileViewport from "@/hooks/useIsMobileViewport";

const MOBILE_SNAP_POINTS: number[] = [0.5, 1];
const DESKTOP_SNAP_POINTS: number[] = [1];
const DRAWER_CONTENT_CLASSES =
    "z-40 rounded-t-xl fixed outline-hidden overflow-hidden bg-card text-card-foreground card-deco " +
    "h-[90%] bottom-0 left-0 right-0 " +
    "md:w-[40%] md:h-[94%] md:bottom-[3%] md:top-[3%] md:left-auto md:right-14 md:rounded-xl " +
    "shadow-2xl";

export const DRAWER_OPEN_CLOSE_ANIM_TIME_MS = 500;

interface VaulDrawerProps {
    open: boolean;
    onClose: () => void;
    onFullyClosed: () => void;
    onOpenWidthChange?: (width: number) => void;
    children?: ReactNode;
}

export default function VaulDrawer({
    open,
    onClose,
    onFullyClosed,
    onOpenWidthChange,
    children,
}: VaulDrawerProps) {
    const [isScrollable, setIsScrollable] = useState(true);
    const isOnClient = useMounted();
    const tCommon = useTranslations("common");
    const isMobile = useIsMobileViewport();

    function animEndListener(event: AnimationEvent<HTMLDivElement>) {
        if (
            event.animationName === "slideToRight" ||
            event.animationName === "slideToBottom"
        ) {
            onFullyClosed();
        }
    }

    function transitionEndListener(event: TransitionEvent<HTMLDivElement>) {
        const contentNode = event.currentTarget as HTMLElement;
        if (
            event.propertyName === "transform" &&
            contentNode.dataset.state === "closed"
        ) {
            onFullyClosed();
        }
    }

     function reportContentWidth(contentNode: HTMLDivElement) {
        if (!contentNode) {
            return;
        }

        //Round off decimal portion.
        const newContentDivWidth = Math.round(
            contentNode.getBoundingClientRect().width,
        );

        console.log("reportContentWidth called", newContentDivWidth);
        onOpenWidthChange?.(newContentDivWidth);
    }

    function onOpenChange(newOpenState: boolean) {
        console.log("onOpenChange called", newOpenState);
        if(!newOpenState) {
            onClose();
        }
    }

    function setActiveSnapPoint(index: string|number|null) {
        if (index === 1) {
            setIsScrollable(true);
        }
        if (index === 0.5) {
            setIsScrollable(false);
        }
    }

    const drawerDir = isMobile ? "bottom" : "right";
    const drawerContentStyle = isMobile ? {} : {
        "--initial-transform": "calc(100% + 3.5rem)",
    } as CSSProperties;

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
            setActiveSnapPoint={setActiveSnapPoint}
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
                    onAnimationEnd={animEndListener}
                    onTransitionEnd={transitionEndListener}
                    style={drawerContentStyle}
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
                                "flex-1 p-4 pt-0 max-h-full overflow-hidden select-text",
                                {
                                    "pointer-events-none":
                                        !isScrollable && isMobile,
                                },
                            )}
                        >
                            {children}
                        </div>

                        {!isMobile && (
                            <Drawer.Close asChild>
                                <div className="flex-[0_1_3rem] px-4 pb-4">
                                    <Button className="bg-accent text-accent-foreground w-full">
                                        <span className="text-lg">
                                            {tCommon("close")}
                                        </span>
                                    </Button>
                                </div>
                            </Drawer.Close>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
