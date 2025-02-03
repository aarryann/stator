import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-show directives vitest tests', () => {
  test(
    'x-show toggles element visibility',
    html`<div x-data='{ "visible": true }'>
      <p x-show="visible">Visible</p>
    </div>`,
    undefined,
    ({ get }) => {
      const paragraph = get('p');
      expect(paragraph.style.display).not.toBe('none');
    }
  );

  test(
    'clicking a button to toggle visibility',
    html`<div x-data="{ isOpen: false }">
      <button @click="isOpen = !isOpen">Click Me</button>
      <span x-show="isOpen"></span>
    </div>`,
    undefined,
    async ({ get, waitFor }) => {
      const span = get('span');
      const button = get('button');

      expect(span.style.display).toEqual('none');
      button.click();
      await waitFor(() => {
        expect(span.style.display).toEqual('none');
      });
    }
  );

  test(
    'x-transition applies transitions on show/hide',
    html`<div x-data='{ "visible": false }'>
      <p x-show="visible" x-transition>Transition Content</p>
      <button @click="visible = !visible;">Toggle</button>
    </div>`,
    undefined,
    async ({ get, waitFor, Stator }) => {
      const paragraph = get('p');
      const button = get('button');

      expect(paragraph.style.display).toBe('none');
      button.click();
      await waitFor(() => {
        expect(paragraph.style.display).not.toBe('none');
      });
    }
  );
});
