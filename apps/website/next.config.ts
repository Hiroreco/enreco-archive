/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    transpilePackages: ["@enreco-archive/common-ui"],
    images: {
        unoptimized: true,
    },
    output: "export",
};

module.exports = withPWA(nextConfig);
