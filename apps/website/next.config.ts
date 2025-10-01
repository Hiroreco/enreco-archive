/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    },
});

const nextConfig = {
    transpilePackages: ["@enreco-archive/common-ui"],
    images: {
        unoptimized: true,
    },
    output: "export",
};

module.exports = withPWA(nextConfig);
