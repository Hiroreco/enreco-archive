import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
    // For static export, we'll always use 'en' as default
    // and handle locale switching client-side
    const locale = "en";

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
