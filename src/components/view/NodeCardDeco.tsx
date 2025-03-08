interface NodeCardDecoSVGProps {
    color: string | null;
}

const NodeCardDeco = ({ color }: NodeCardDecoSVGProps) => {
    return (
        <div
            className="w-full rounded-t-xl h-[100px] z-0 dark:brightness-[0.87]"
            style={{ backgroundColor: color || "" }}
        >
            <div className="deco-node w-full h-full opacity-30" />
            <div
                className="mt-[10px] w-full h-[5px] z-0 "
                style={{ backgroundColor: color || "" }}
            />
        </div>
    );
};

export default NodeCardDeco;
