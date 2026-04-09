import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintReact from "@eslint-react/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.{tsx,jsx}"],
    ...eslintReact.configs.recommended,
  },
  {
    files: ["*.config.{js,mjs,ts}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // shadcn UI components are generated code — relax rules that conflict
    files: ["src/components/ui/**/*.{tsx,jsx}"],
    rules: {
      "@eslint-react/no-nested-component-definitions": "off",
      "@eslint-react/component-hook-factories": "off",
      "@eslint-react/no-use-context": "off",
      "@eslint-react/no-context-provider": "off",
      "@eslint-react/no-array-index-key": "off",
      "@eslint-react/set-state-in-effect": "off",
      "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
    },
  },
  {
    ignores: ["dist/", ".astro/", "node_modules/"],
  },
);
