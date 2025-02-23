import EditorApp from "@/components/editor/EditorApp";
import { ViewAppWrapper } from "@/ViewAppWrapper";
import { ReactFlowProvider } from "@xyflow/react";
import { Metadata } from "next";
import PreloadResources from "./preload-resources";

const USE_EDITOR = false;
const inDevEnvironment = !!process && process.env.NODE_ENV === "development";

export const metadata: Metadata = {
    title: "ENreco Archive",
    icons: ["favicon.svg"],
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
