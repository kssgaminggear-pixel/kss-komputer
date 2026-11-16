import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const PRICE_LEAK_MESSAGE =
  "Jangan impor data mentah/harga dari modul server. Gunakan DTO publik dari Server Component.";

const serverOnlyPaths = [
  {
    name: "@/lib/mock-data",
    message: PRICE_LEAK_MESSAGE,
  },
  {
    name: "@/lib/server-catalog",
    message: PRICE_LEAK_MESSAGE,
  },
  {
    name: "@/lib/server-pricing",
    message: PRICE_LEAK_MESSAGE,
  },
];

const serverOnlyPatterns = [
  {
    group: ["**/mock-data", "**/server-catalog", "**/server-pricing"],
    message: PRICE_LEAK_MESSAGE,
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [serverOnlyPaths[0]],
          patterns: [
            { group: ["**/mock-data"], message: PRICE_LEAK_MESSAGE },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*Client.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: serverOnlyPaths,
          patterns: serverOnlyPatterns,
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}", "src/store/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: serverOnlyPaths,
          patterns: serverOnlyPatterns,
        },
      ],
    },
  },
  {
    files: ["src/app/admin/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
