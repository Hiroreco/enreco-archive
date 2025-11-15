import BasicEgg from "@/components/view/easter-eggs/BasicEgg";

interface ViewShioriGameEasterEggProps {
    className?: string;
}

const ViewShioriGameEasterEgg = ({
    className,
}: ViewShioriGameEasterEggProps) => {
    return (
        <BasicEgg
            imageName="easter-shiori"
            eggName="shiori-game"
            className={className}
        />
    );
};

export default ViewShioriGameEasterEgg;
