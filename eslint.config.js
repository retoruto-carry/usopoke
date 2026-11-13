import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["build/", ".react-router/", ".wrangler/", "worker-configuration.d.ts"]),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommended, importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],
    settings: {
      "import/resolver": { typescript: {} },
    },
    rules: {
      "import/no-unresolved": ["error", { ignore: ["^virtual:react-router/"] }],
    },
  },
  {
    files: ["**/*.tsx"],
    extends: [react.configs.flat.recommended, react.configs.flat["jsx-runtime"], jsxA11y.flatConfigs.recommended],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
    },
    settings: { react: { version: "detect" } },
  },
);
