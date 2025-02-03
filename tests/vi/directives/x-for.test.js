import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-for directives vitest tests', () => {
  test(
    'x-for loops through arrays',
    html`<div x-data='{ "items": ["One", "Two", "Three"] }'>
      <template x-for="item in items">
        <p x-text="item"></p>
      </template>
    </div>`,
    undefined,
    ({ get, a }) => {
      const paragraphs = get(a`p`);
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0].textContent).toBe('One');
      expect(paragraphs[1].textContent).toBe('Two');
      expect(paragraphs[2].textContent).toBe('Three');
    }
  );

  test(
    'Nested x-for loops render correctly',
    html`<div x-data='{ "lists": [{ "items": ["A", "B"] }, { "items": ["C", "D"] }] }'>
      <template x-for="list in lists">
        <div>
          <template x-for="item in list.items">
            <p x-text="item"></p>
          </template>
        </div>
      </template>
    </div>`,
    undefined,
    ({ get, a }) => {
      const paragraphs = get(a`p`);
      expect(paragraphs.length).toBe(4);
      expect(paragraphs[0].textContent).toBe('A');
      expect(paragraphs[1].textContent).toBe('B');
      expect(paragraphs[2].textContent).toBe('C');
      expect(paragraphs[3].textContent).toBe('D');
    }
  );

  test(
    'generates unique IDs using $id',
    html`<div x-data="{ id: $id('unique') }">
      <p x-text="id"></p>
    </div>`,
    undefined,
    ({ get, t }) => {
      const id = get('p').textContent;
      expect(id).toContain('unique');
    }
  );
});
