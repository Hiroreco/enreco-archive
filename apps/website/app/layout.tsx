"use client";
import "@/index.css";
import { useSettingStore, FontSize } from "@/store/settingStore";
import { PT_Sans } from "next/font/google";
import { useEffect, useState } from "react";

const ptSans = PT_Sans({
    subsets: ["latin"],
    weight: ["400", "700"],
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

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const fontSizeValue = mounted ? getFontSizeValue(fontSize) : "16px";

    return (
        <html
            lang="en"
            className={`${ptSans.className}`}
            style={{
                fontSize: fontSizeValue,
                transition: "font-size 0.2s ease-in-out",
            }}
        >
            <body>{children}</body>
        </html>
    );
}
