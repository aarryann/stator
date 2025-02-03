import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-init directives vitest tests', () => {
  test(
    'x-init runs initialization expressions',
    html`<div x-data='{ "foo": "bar" }' x-init='foo = "baz"'>
      <p x-text="foo"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const paragraph = get('p');
      expect(paragraph.textContent).toBe('baz');
    }
  );
});
