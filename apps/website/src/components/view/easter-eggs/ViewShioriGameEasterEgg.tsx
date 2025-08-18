import ViewBasicEgg from "@/components/view/easter-eggs/ViewBasicEgg";

interface ViewShioriGameEasterEggProps {
    className?: string;
}

const ViewShioriGameEasterEgg = ({
    className,
}: ViewShioriGameEasterEggProps) => {
    return (
        <ViewBasicEgg
            imageName="easter-shiori"
            eggName="shiori-game"
            className={className}
        />
    );
};

export default ViewShioriGameEasterEgg;
