/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    workboxOptions: {
        disableDevLogs: true,
        cleanupOutdatedCaches: true,
        // Add additional precache entries
        additionalManifestEntries: [{ url: "/index.html", revision: null }],
        // Handle navigation requests
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
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
