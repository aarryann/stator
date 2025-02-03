import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-ref directives vitest tests', () => {
  test(
    'resolves DOM elements using $refs',
    html`<div x-data>
      <button x-ref="myButton">Click Me</button>
      <p x-text="$refs.myButton.textContent"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const paragraph = get('p');
      expect(paragraph.textContent).toBe('Click Me');
    }
  );
});
