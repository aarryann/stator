import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Stator x-data directives vitest tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js

  test(
    'nested x-data test',
    html`<div x-data='{ "foo": "bar", "count":1 }'>
      <div x-data='{ "baz": "goo" }'>
        <div x-data='{ "foo": baz }'>
          <span id="bazSpan" x-text="foo">1</span>
        </div>
      </div>
      <span id="barSpan" x-text="foo">2</span>
    </div>`,
    undefined,
    ({ get }) => {
      const bazSpan = get('#bazSpan');
      const barSpan = get('#barSpan');
      expect(barSpan.textContent).toBe('bar');
      expect(bazSpan.textContent).toBe('goo');
    }
  );
});
