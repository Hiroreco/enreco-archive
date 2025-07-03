import ViewBasicEgg from "@/components/view/easter-eggs/ViewBasicEgg";

const ViewGuraEasterEgg = () => {
    return (
        <ViewBasicEgg
            imageName="easter-gura"
            sfxName="easter/easter-gura"
            delayDuration={17000}
            className="-bottom-[100px] h-[150px]"
        />
    );
};

export default ViewGuraEasterEgg;
