import "@/index.css";

import { PT_Sans } from "next/font/google";

const ptSans = PT_Sans({
    subsets: ["latin"],
    weight: ["400", "700"],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${ptSans.className}`}>
            <body>{children}</body>
        </html>
    );
}
