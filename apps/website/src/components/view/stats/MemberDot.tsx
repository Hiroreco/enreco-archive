import Image from "next/image";
import { useState } from "react";
import type { Talent, LocalizedString } from "./types";
import { useSettingStore } from "@/store/settingStore";

// Helper to get localized text
function getLocalizedText(text: LocalizedString | string, locale: "en" | "ja"): string {
  if (typeof text === "string") return text;
  return text[locale];
}

interface MemberDotProps {
    talent: Talent;
    accentColor?: string; // overrides talent color for border/bg tint
    size?: number; // px, default 20
}

export function MemberDot({ talent, accentColor, size = 20 }: MemberDotProps) {
    const locale = useSettingStore((state) => state.locale);
    const [imgError, setImgError] = useState(false);
    const color = accentColor ?? talent.color;
    const talentName = getLocalizedText(talent.name, locale);

    return (
        <div
            className="relative group flex-shrink-0"
            style={{ width: size, height: size }}
        >
            <div
                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center border"
                style={{
                    borderColor: `${color}66`,
                    background: imgError ? `${color}22` : undefined,
                }}
            >
                {!imgError ? (
                    <Image
                        src={talent.image}
                        alt={talentName}
                        width={size}
                        height={size}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <span
                        className="font-medium select-none leading-none"
                        style={{ fontSize: size * 0.35, color }}
                    >
                        {talent.initials}
                    </span>
                )}
            </div>

            {/* Tooltip */}
            <div
                className="
          absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-700
          rounded-md px-2 py-0.5
          text-[11px] text-neutral-800 dark:text-neutral-100
          whitespace-nowrap pointer-events-none
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
          z-20
        "
            >
                {talentName}
            </div>
        </div>
    );
}
