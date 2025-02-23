import { cn } from "@/lib/utils";
import { useState } from "react";
import { Drawer } from "vaul";

interface VaulDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    disableScrollablity: boolean;
    children: React.ReactNode;
}

export default function VaulDrawer({
    open,
    onOpenChange,
    disableScrollablity,
    children,
}: VaulDrawerProps) {
    const [isScrollable, setIsScrollable] = useState(false);
    return (
        <Drawer.Root
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[0.5, 1]}
            setActiveSnapPoint={(index) => {
                if (index === 1) {
                    setIsScrollable(true);
                }
                if (index === 0.5) {
                    setIsScrollable(false);
                }
            }}
            snapToSequentialPoint
            fadeFromIndex={0}
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />
                <Drawer.Content className="bg-gray-100 z-50 flex flex-col rounded-t-[10px] mt-24 h-[80vh] fixed bottom-0 left-0 right-0 outline-none overflow-hidden">
                    {/* Setting min-h to the containter's height makes it shows children that have less content, idk why this works */}
                    <div
                        className={cn(
                            "p-4 bg-background text-foreground h-[80vh] max-h-full",
                            {
                                "overflow-auto":
                                    isScrollable && !disableScrollablity,
                            },
                        )}
                    >
                        {children}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
