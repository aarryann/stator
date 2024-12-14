import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['off'],
      'no-useless-escape': ['off']
    }
  },
  {
    ignores: [
      '**/dist/', // Ignore all files in the 'dist' directory
      '**/node_modules/', // Ignore 'node_modules' directory
      '**/*.min.js', // Ignore minified JavaScript files
      '**/build/' // Ignore 'build' directory
    ]
  }
];
