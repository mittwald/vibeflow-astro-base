import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
  globalIgnores(["dist/**", ".astro/**", "node_modules/**", ".pnpm-store/**", "coverage/**"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.{js,mjs,ts,tsx,astro}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.{tsx,jsx}"],
    ...eslintReact.configs.recommended,
  },
  {
    files: ["*.config.{js,mjs,ts}", "scripts/**/*.{js,mjs,ts}", "plugins/**/*.{js,mjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{tsx,jsx}"],
    rules: {
      "@eslint-react/no-nested-component-definitions": "off",
      "@eslint-react/component-hook-factories": "off",
      "@eslint-react/no-use-context": "off",
      "@eslint-react/no-context-provider": "off",
      "@eslint-react/no-array-index-key": "off",
      "@eslint-react/set-state-in-effect": "off",
      "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
]);
