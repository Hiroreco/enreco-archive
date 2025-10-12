import { ReactNode, useCallback } from "react";
import "@/components/view/markdown/ButtonLink.css";
import { useGlossary } from "@/contexts/GlossaryContext";
import { ArrowUpRight } from "lucide-react";

interface ItemLinkProps {
    itemId: string;
    children?: ReactNode;
}

export default function EntryLink({ itemId, children }: ItemLinkProps) {
    const { registry, selectItem } = useGlossary();
    const entry = registry[itemId];

    const handleClick = useCallback(() => {
        if (entry) {
            // Capture current scroll position
            const isMobile = window.innerWidth < 768;
            let scrollPosition = 0;

            if (isMobile) {
                // On mobile, the entire viewer container is scrollable
                const viewerContainer = document.querySelector(
                    "#glossary-viewer-container",
                ) as HTMLElement;
                scrollPosition = viewerContainer?.scrollTop || 0;
            } else {
                // On desktop, only the content area is scrollable
                const contentContainer = document.querySelector(
                    "#glossary-viewer-content-container",
                ) as HTMLElement;
                scrollPosition = contentContainer?.scrollTop || 0;
            }

            selectItem(entry, scrollPosition);
        }
    }, [entry, selectItem]);
    return (
        <span
            className="text-accent hover:underline hover:underline-offset-2 cursor-pointer font-semibold"
            onClick={handleClick}
        >
            <span className="italic">
                {children}
                <ArrowUpRight className="inline size-5" />
            </span>
        </span>
    );
}
