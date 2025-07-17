import { nextJsConfig } from "@enreco-archive/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
    ...nextJsConfig,
    {
        rules: {
            "@next/next/no-img-element": "off"
        }
    }
];