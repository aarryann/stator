import { expect, test } from '../fixtures/base';

test.skip('has title', async ({ specPage }) => {
  await specPage.goto();
  //await specPage.isReady();

  await expect.soft(specPage).toHaveTitle(/Stator/);
});

test.skip('Test with reload and window access', async ({ specPage }) => {
  await specPage.goto();
  const { reload, window, document } = await specPage.embedHTML('<div id="message">Hello</div>');

  // Verify text content before reload
  await expect(specPage.page.locator('#message')).toHaveText('Hello');

  // Interact with window/document if needed
  const title = await window.evaluate(w => w.document.title);
  console.log('Page title:', title);

  // Reload and verify content persists
  await reload();
  await expect(specPage.page.locator('#message')).toHaveText('Hello');
});
