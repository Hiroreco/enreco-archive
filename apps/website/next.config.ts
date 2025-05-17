/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@enreco-archive/common-ui"],
    images: {
        unoptimized: true,
    },
    output: "export", // Outputs a Single-Page Application (SPA).
};

export default nextConfig;
