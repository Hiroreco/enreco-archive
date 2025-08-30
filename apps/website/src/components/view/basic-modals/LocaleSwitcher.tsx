import { useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";

const LocaleSwitcher = () => {
    const locale = useSettingStore((state) => state.locale);
    const setLocale = useSettingStore((state) => state.setLocale);
    return (
        <Button
            variant={null}
            onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
        >
            <code className="cursor-pointer text-lg font-bold">
                {locale === "ja" ? "JA" : "EN"}
            </code>
        </Button>
    );
};

export default LocaleSwitcher;
