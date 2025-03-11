import { cn, getViewportSize } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback, useMemo, useState } from "react";
import { Drawer } from "vaul";
import { Button } from "../ui/button";
import { useMounted } from "@/hooks/useMounted";

const MOBILE_SNAP_POINTS: number[] = [0.5, 1];
const DESKTOP_SNAP_POINTS: number[] = [1];
const DRAWER_CONTENT_CLASSES = 
    "z-50 rounded-t-xl fixed outline-none overflow-hidden bg-card text-card-foreground card-deco " + 
    "h-[90%] bottom-0 left-0 right-0 " + 
    "md:w-[40%] md:h-[94%] md:bottom-[3%] md:top-[3%] md:left-auto md:right-14 md:rounded-xl " +
    "shadow-2xl";

interface VaulDrawerProps {
    open: boolean;
    disableScrollablity: boolean;
    onOpenChange: (open: boolean) => void;
    onOpenFullyChange?: (open: boolean) => void;
    onWidthChange?: (width: number) => void;
    onCloseAnimationEnd?: () => void;
    children?: React.ReactNode;
}

export default function VaulDrawer({
    open,
    onOpenChange,
    onOpenFullyChange,
    onWidthChange,
    onCloseAnimationEnd,
    disableScrollablity,
    children,
}: VaulDrawerProps) {
    const [isScrollable, setIsScrollable] = useState(true);
    const isOnClient = useMounted();

    const reportContentWidth = useCallback((contentNode: HTMLDivElement) => {
        if(!contentNode) {
            return;
        }

        onWidthChange?.(contentNode.getBoundingClientRect().width);

        const animEndListener = (event: AnimationEvent) => {
            if(event.animationName === "slideToRight" || event.animationName === "slideToBottom") {
                onCloseAnimationEnd?.();
            }
        };

        contentNode.addEventListener("animationend", animEndListener);

        return () => {
            contentNode.removeEventListener("animationend", animEndListener);
        }
    }, [onCloseAnimationEnd, onWidthChange]);

    const viewportInfo = getViewportSize();
    const isMobile = viewportInfo.width <= 768;

    const drawerDir = useMemo(() => isMobile ? "bottom" : "right", [isMobile]);

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
            snapPoints={ isMobile ? MOBILE_SNAP_POINTS : DESKTOP_SNAP_POINTS }
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
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />

                <Drawer.Content 
                    className={DRAWER_CONTENT_CLASSES} 
                    ref={reportContentWidth}
                    style={ isMobile ? {} : { '--initial-transform': 'calc(100% + 3.5rem)' } as React.CSSProperties }
                >
                    <VisuallyHidden>
                        <Drawer.Title>Vaul Drawer</Drawer.Title>
                    </VisuallyHidden>

                    <div className="flex flex-col h-full max-h-full">
                        <div className="flex-initial block md:hidden bg-foreground opacity-75 w-2/4 min-h-2 h-2 mx-auto my-4 rounded-full" />
                        <div className="flex-initial md:block hidden w-2/4 min-h-2 h-2 mx-auto my-2" />
                        <div
                            className={cn(
                                "flex-1 p-4 pt-0 max-h-full overflow-hidden pointer-events-none",
                                {
                                    "pointer-events-auto":
                                        isScrollable && !disableScrollablity,
                                },
                            )}
                        >
                            {children}
                        </div>

                        {!isMobile && (
                            <div className="flex-[0_1_3rem] px-4 pb-4">
                            <Button className="bg-accent text-foreground w-full" onClick={() => onOpenChange(false)}>
                                <span className="text-lg text-primary-foreground">Close</span>
                            </Button>
                        </div>    
                        )}

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}