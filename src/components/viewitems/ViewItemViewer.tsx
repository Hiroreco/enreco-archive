import { ViewMarkdown } from "@/components/view/ViewMarkdown";
import ViewModelViewer from "@/components/viewitems/ViewModelViewer";
import { CommonItemData } from "@/lib/type";

interface ViewItemViewerProps {
    item: CommonItemData;
}

const ViewItemViewer = ({ item }: ViewItemViewerProps) => {
    return (
        <div className="w-full h-full flex md:flex-row gap-4 relative">
            <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-background/10 backdrop-blur-md border border-white/20 shadow-lg">
                <ViewMarkdown
                    onNodeLinkClicked={() => {}}
                    onEdgeLinkClicked={() => {}}
                >
                    {item.content}
                </ViewMarkdown>
            </div>
            <div className="max-w-[300px]">
                {item.modelSrc && <ViewModelViewer modelPath={item.modelSrc} />}
                <div className="mt-4">
                    <p className="text-center underline underline-offset-2 text-xl font-semibold">
                        {item.name}
                    </p>

                    <p className="mt-4">
                        "Tickle tickle or sth Idk I'm just trying to fill up
                        this space" - Shiori, not really
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ViewItemViewer;
