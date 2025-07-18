import { Separator } from "@enreco-archive/common-ui/components/separator";
import { ExternalLink } from "lucide-react";

interface LightboxInfoProps {
    alt: string;
    authorSrc?: string;
}

export const LightboxInfo = ({ alt, authorSrc }: LightboxInfoProps) => {
    return (
        <div className="flex justify-center items-center gap-2">
            <Separator className="flex-1 bg-foreground/80 md:max-w-[200px]" />
            <span className="text-white flex items-center gap-1 text-center font-semibold text-sm md:text-lg">
                {alt}
                {authorSrc && (
                    <a
                        href={authorSrc}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className="size-4 stroke-white" />
                    </a>
                )}
            </span>
            <Separator className="flex-1 bg-foreground/80 md:max-w-[200px]" />
        </div>
    );
};
