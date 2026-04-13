import Image from "next/image";
import { useState } from "react";
import type { Talent, LocalizedString } from "./types";
import { useSettingStore } from "@/store/settingStore";

function getLocalizedText(
    text: LocalizedString | string,
    locale: "en" | "ja",
): string {
    if (typeof text === "string") return text;
    return text[locale];
}

interface MemberAvatarProps {
    talent: Talent;
    size?: number; // px, default 40
    showTooltip?: boolean;
}

export function MemberAvatar({
    talent,
    size = 40,
    showTooltip = true,
}: MemberAvatarProps) {
    const locale = useSettingStore((state) => state.locale);
    const [imgError, setImgError] = useState(false);
    const talentName = getLocalizedText(talent.name, locale);

    return (
        <div
            className="relative flex-shrink-0 group"
            style={{ width: size, height: size }}
        >
            <div
                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center border"
                style={{
                    borderColor: `${talent.color}55`,
                    background: imgError ? `${talent.color}22` : undefined,
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
                        className="font-medium select-none"
                        style={{
                            fontSize: size * 0.28,
                            color: talent.color,
                        }}
                    >
                        {talent.initials}
                    </span>
                )}
            </div>

            {showTooltip && (
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
            )}
        </div>
    );
}
