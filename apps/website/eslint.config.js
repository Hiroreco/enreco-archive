import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { nextJsConfig } from "@enreco-archive/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [...next, ...nextCoreWebVitals, ...nextTypescript, ...nextJsConfig, {
    rules: {
        "@next/next/no-img-element": "off"
    }
}, {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}];