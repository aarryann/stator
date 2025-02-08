import { test as base, expect } from '@playwright/test';
import { SpecPage } from './pomindex';

export const test = base.extend({
  specPage: async ({ page }, use) => {
    await use(new SpecPage(page));
  }
});

export { expect };
