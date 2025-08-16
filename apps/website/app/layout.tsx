"use client";
import "@/index.css";
import { useAudioSettingsSync } from "@/store/audioStore";
import { FontSize, useSettingStore } from "@/store/settingStore";
import { Libre_Franklin } from "next/font/google";
import { useEffect, useState } from "react";

const libreFranklin = Libre_Franklin({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

function getFontSizeValue(fontSize: FontSize): string {
    switch (fontSize) {
        case "small":
            return "14px";
        case "medium":
            return "16px";
        case "large":
            return "18px";
        case "xlarge":
            return "20px";
        default:
            return "16px";
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);
    const fontSize = useSettingStore((state) => state.fontSize);

    // Sync audio settings
    useAudioSettingsSync();

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const fontSizeValue = mounted ? getFontSizeValue(fontSize) : "16px";

    return (
        <html
            lang="en"
            className={`${libreFranklin.className}`}
            style={{
                fontSize: fontSizeValue,
                transition: "font-size 0.2s ease-in-out",
            }}
        >
            <body>{children}</body>
        </html>
    );
}
