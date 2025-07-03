import ViewBasicEgg from "@/components/view/easter-eggs/ViewBasicEgg";

const ViewInaEasterEgg = () => {
    return (
        <ViewBasicEgg
            imageName="easter-ina"
            sfxName="easter/easter-ina"
            delayDuration={5000}
            className="-bottom-[80px]"
        />
    );
};

export default ViewInaEasterEgg;
