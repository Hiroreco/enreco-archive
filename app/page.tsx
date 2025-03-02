import EditorApp from "@/components/editor/EditorApp";
import { ViewAppWrapper } from "@/ViewAppWrapper";
import { ReactFlowProvider } from "@xyflow/react";
import { Metadata, Viewport } from "next";
import PreloadResources from "./preload-resources";

const USE_EDITOR = false;
const inDevEnvironment = !!process && process.env.NODE_ENV === "development";

export const metadata: Metadata = {
    title: "ENreco Archive",
    icons: ["favicon.svg"],
    description:
        "Welcome to ENreco Archive! A fan project dedicated to archiving (almost) everything that transpired during the events of Enigmatic Recollection. From daily recaps and character relationships to major storylines that shaped the entire narrative, everything is compiled into byte-sized cards with timestamps—perfect for those looking to catch up on the series or simply relive their favorite moments.",
    keywords: [
        "hololive",
        "enreco",
        "archive",
        "fan project",
        "enigmatic recollection",
        "english",
        "fanmade",
        "relationship chart",
        "recap",
        "stream",
        "chapter",
        "day",
        "card",
    ],
    applicationName: "ENreco Archive",
    authors: [
        {
            name: "Hiro",
            url: "https://x.com/hiroavrs",
        },
        {
            name: "Tactician_Walt",
            url: "https://x.com/Walt280",
        },
    ],
    creator: "ENreco Archive Team",
    category: "Entertainment",
    classification: "Fan Project",
    twitter: {
        site: "@enrecoarchive",
        creator: "@hiroavrs",
        card: "summary_large_image",
        // Embed doesn't suport webp
        images: "/embed.png",
    },
    openGraph: {
        type: "website",
        // TODO: change this to the actual URL when ready
        url: "https://dev.enreco-archive.net",
        title: "ENreco Archive",
        description:
            "Welcome to ENreco Archive! A fan project dedicated to archiving (almost) everything that transpired during the events of Enigmatic Recollection. From daily recaps and character relationships to major storylines, everything is compiled neatly for those looking to catch up on the series or simply relive their favorite moments.",
        siteName: "ENreco Archive",
        images: {
            // Embed doesn't suport webp
            url: "/embed.png",
        },
        locale: "en_US",
    },
};

export const viewport: Viewport = {
    themeColor: "#6f9cc0",
};

const Page = () => {
    if (USE_EDITOR && inDevEnvironment) {
        return (
            <ReactFlowProvider>
                <EditorApp />
            </ReactFlowProvider>
        );
    }

    return (
        <ReactFlowProvider>
            <PreloadResources />
            <ViewAppWrapper />
        </ReactFlowProvider>
    );
};

export default Page;
