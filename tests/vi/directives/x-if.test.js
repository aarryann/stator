import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-if directives vitest tests', () => {
  test(
    'x-if renders and destroys elements',
    html`<div x-data='{ "show": true }'>
      <template x-if="show">
        <p>Conditionally Rendered</p>
      </template>
    </div>`,
    undefined,
    ({ get }) => {
      const paragraph = get('p');
      expect(paragraph).not.toBeNull();
    }
  );
});
