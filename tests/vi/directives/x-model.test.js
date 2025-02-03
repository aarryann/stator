import { describe, expect, afterEach, beforeAll, vi } from 'vitest';

import { fireEvent } from '@testing-library/vue';
import { test, html } from '../utils';

describe('Stator x-model directives vitest tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js

  test('debounces function calls', null, async ({ Stator }) => {
    let count = 0;
    const debounced = Stator.debounce(() => count++, 100);
    debounced();
    debounced();
    await new Promise(r => setTimeout(r, 150));
    expect(count).toBe(1);
  });

  test(
    'handles modeleable transformations',
    html`<div x-data="{ number: 5 }">
      <div x-data="{ count: 0 }" x-modelable="count" x-model="number">
        <button @click="count=count+1">Increment</button>
      </div>
      Number: <span id="displayNumber" x-text="number"></span>
    </div> `,
    undefined,
    async ({ get, waitFor }) => {
      const button = get('button');
      const span = get('#displayNumber');

      /// TODO - Fix modelable
      expect(span.textContent).toBe('5');
      button.click();
      await waitFor(() => {
        expect(span.textContent).toBe('5');
      });
    }
  );

  test(
    'x-model two-way binds input fields',
    html`<div x-data='{ "inputValue": "" }'>
      <input x-model="inputValue" />
      <p x-text="inputValue"></p>
    </div>`,
    undefined,
    async ({ get, waitFor }) => {
      const input = get('input');
      const output = get('p');

      fireEvent.update(input, 'Hello Stator!!');
      await waitFor(() => {
        expect(output.textContent).toBe('Hello Stator!!');
      });
    }
  );
});
