import { Locale, useSettingStore } from "@/store/settingStore";
import { Button } from "@enreco-archive/common-ui/components/button";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@enreco-archive/common-ui/components/tabs";

const LocaleSwitcher = () => {
    const locale = useSettingStore((state) => state.locale);
    const setLocale = useSettingStore((state) => state.setLocale);
    return (
        <div>
            <Button
                variant={"outline"}
                onClick={() => setLocale(locale === "ja" ? "en" : "ja")}
                className="md:hidden"
            >
                <code className="cursor-pointer text-lg font-bold">
                    {locale === "ja" ? "JA" : "EN"}
                </code>
            </Button>
            <Tabs
                orientation="vertical"
                defaultValue={locale}
                value={locale}
                onValueChange={(value) => {
                    setLocale(value as Locale);
                }}
                className="hidden md:block"
            >
                <TabsList>
                    <TabsTrigger value="en">
                        <code className="cursor-pointer text-lg font-bold">
                            EN
                        </code>
                    </TabsTrigger>
                    <TabsTrigger value="ja">
                        <code className="cursor-pointer text-lg font-bold">
                            JA
                        </code>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
};

export default LocaleSwitcher;
