import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Specify your test directory
    dir: './tests/vi',
    environment: 'jsdom', // Important for DOM testing
    globals: true, // Optional: global test utilities

    // Optional: coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages'],
      exclude: [
        '**/node_modules/', // Ignore node_modules
        '**/dist/', // Ignore build output
        '**/*.min.js', // Ignore test files globally
        '**/builds/'
      ]
    }
  }
});
