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
        if (entry) selectItem(entry);
    }, [entry, selectItem]);

    return (
        <button
            className="text-accent inline-flex items-center hover:underline hover:underline-offset-2"
            onClick={handleClick}
        >
            <span className="font-semibold">{children}</span>
            <ArrowUpRight />
        </button>
    );
}
