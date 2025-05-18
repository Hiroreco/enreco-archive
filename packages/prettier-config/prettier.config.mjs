/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  tabWidth: 4,
  excludeFiles: [
    // Ignore artifacts:
    "build",
    "coverage",

    // Don't format JSON files
    "**/*.json"
  ]
};
  
export default config;