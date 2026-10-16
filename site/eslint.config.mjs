import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy static site, reference docs and untrusted scratch downloads.
    ".scratch/**",
    "public/**",
    "docs/**",
    "index.html",
    "index.bak",
    "index.html_temp_video",
    ".cursor/**",
    ".orchids/**",
  ]),
]);

export default eslintConfig;
