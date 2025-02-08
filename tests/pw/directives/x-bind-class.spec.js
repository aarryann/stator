import { expect, test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('has title', async ({ page }) => {
  const filePath = `file://${path.resolve(__dirname, '../spec.html')}`;
  await page.goto(filePath);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Stator/);
});

/*
testa(
  'class attribute bindings are merged by string syntax',
  html`
    <div x-data="{ isOn: false }">
      <span class="foo" x-bind:class="isOn ? 'bar': ''"></span>

      <button @click="isOn = ! isOn">button</button>
    </div>
  `,
  async ({ page }) => {
    
    page('span').should(haveClasses(['foo']));
    page('span').should(notHaveClasses(['bar']));
    page('button').click();
    page('span').should(haveClasses(['foo']));
    page('span').should(haveClasses(['bar']));
    
    const span = page.locator('span');
    const button = page.locator('button');
    await page.waitForSelector('span');

    await page.waitForTimeout(100);
    await expect(span).toHaveClass(/foo/);
    await expect(span).not.toHaveClass(/bar/);

    await button.click();
    await page.waitForTimeout(100);
    await expect(span).toHaveClass(/bar/);
  }
);
*/
/*
test(
  'class attribute bindings are added by string syntax',
  html`
    <div x-data="{ initialClass: 'foo' }">
      <span x-bind:class="initialClass"></span>
    </div>
  `,
  async ({ page }) => page('span').should(haveClasses(['foo']))
);

test(
  'class attribute bindings are added by array syntax',
  html`
    <div x-data="{ initialClass: 'foo' }">
      <span x-bind:class="[initialClass, 'bar']"></span>
    </div>
  `,
  async ({ page }) => page('span').should(haveClasses(['foo', 'bar']))
);

test(
  'class attribute bindings are added by object syntax',
  html`
    <div x-data="{ mode: 0 }">
      <span
        class="foo baz"
        x-bind:class="{
                      'foo bar border-blue-900' : mode === 0,
                      'foo bar border-red-900' : mode === 1,
                      'bar border-red-900' : mode === 2,
                  }"
      ></span>

      <button @click="mode = (mode + 1) % 3">button</button>
    </div>
  `,
  async ({ page }) => {
    page('span').should(haveClasses(['foo', 'baz']));
    page('span').should(haveClasses(['bar', 'border-blue-900']));
    page('span').should(notHaveClasses(['border-red-900']));
    page('button').click();
    page('span').should(haveClasses(['foo', 'baz']));
    page('span').should(haveClasses(['bar', 'border-red-900']));
    page('span').should(notHaveClasses(['border-blue-900']));
    page('button').click();
    page('span').should(haveClasses(['baz']));
    page('span').should(haveClasses(['bar', 'border-red-900']));
    page('span').should(notHaveClasses(['foo']));
    page('span').should(notHaveClasses(['border-blue-900']));
  }
);

test(
  'classes are removed before being added',
  html`
    <div x-data="{ isOpen: true }">
      <span class="text-red" :class="isOpen ? 'block' : 'hidden'"> Span </span>
      <button @click="isOpen = !isOpen">click me</button>
    </div>
  `,
  async ({ page }) => {
    page('span').should(haveClasses(['block', 'text-red']));
    page('button').click();
    page('span').should(haveClasses(['hidden', 'text-red']));
    page('span').should(notHaveClasses(['block']));
  }
);

test(
  'extra whitespace in class binding string syntax is ignored',
  html`
    <div x-data>
      <span x-bind:class="'  foo  bar  '"></span>
    </div>
  `,
  async ({ page }) => page('span').should(haveClasses(['foo', 'bar']))
);

test(
  'undefined class binding resolves to empty string',
  html`
    <div x-data="{ errorClass: (hasError) => { if (hasError) { return 'red' } } }">
      <span id="error" x-bind:class="errorClass(true)">should be red</span>
      <span id="empty" x-bind:class="errorClass(false)">should be empty</span>
    </div>
  `,
  async ({ page }) => {
    page('span:nth-of-type(1)').should(haveClasses(['red']));
    page('span:nth-of-type(2)').should(notHaveClasses(['red']));
  }
    
);
*/
