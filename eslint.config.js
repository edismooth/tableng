// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const tailwindcss = require("eslint-plugin-tailwindcss");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "tng",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "tng",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@angular-eslint/no-empty-lifecycle-method": "warn",
      "@angular-eslint/prefer-inject": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/consistent-indexed-object-style": "warn",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    plugins: {
      tailwindcss: tailwindcss,
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": [
        "warn",
        {
          "whitelist": [
            "tableng-.*"
          ]
        }
      ],
      "tailwindcss/no-contradicting-classname": "error",
    },
  }
);
