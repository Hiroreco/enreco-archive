import EditorApp from "@/components/editor/EditorApp";
import { ReactFlowProvider } from "@xyflow/react";

function Page() {
    return (
        <ReactFlowProvider>
            <EditorApp />
        </ReactFlowProvider>
    );
}

export default Page;
