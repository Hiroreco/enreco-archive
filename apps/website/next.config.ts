/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
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
    output: "export", // Outputs a Single-Page Application (SPA).
};

const configWithPWA = withPWA(nextConfig);

export default configWithPWA;
