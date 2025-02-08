import { expect, test } from '../fixtures/base';

test('sets attribute bindings on initialize', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
        <div x-data="{ foo: 'bar' }">
            <span x-ref="me" x-bind:foo="foo">[Subject]</span>
        </div>
    `);

  //const body = await specPage.locator('body').innerHTML();
  //console.log(body);

  // Verify the attribute binding
  await expect(specPage.page.locator('span')).toHaveAttribute('foo', 'bar');
});
