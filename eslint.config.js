import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config} */
export default {
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node
    }
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    pluginJs.configs.recommended,
    'eslint:recommended' // Adds recommended ESLint rules
  ],
  rules: {
    semi: ['error', 'always'], // Requires semicolons
    quotes: ['error', 'single'] // Enforces single quotes
  }
};
