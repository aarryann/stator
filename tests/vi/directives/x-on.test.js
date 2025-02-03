import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-on directives vitest tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js

  test(
    'x-on with .prevent stops default action',
    html`<div x-data='{ "submitted": false }'>
      <form @submit.prevent="submitted = true">
        <button type="submit">Submit</button>
      </form>
    </div>`,
    undefined,
    ({ get }) => {
      const button = get('button');
      button.click();

      expect(get('[x-data]')._x_dataStack[0].submitted).toBe(true);
    }
  );

  test(
    'x-on handles events',
    html`<div x-data='{ "count": 0 }'>
      <button x-on:click="count=count+1">Click</button>
      <span x-text="count"></span>
    </div>`,
    undefined,
    async ({ get, waitFor }) => {
      const button = get('button');
      const span = get('span');

      expect(span.textContent).toBe('0');

      button.click();
      await waitFor(() => {
        expect(span.textContent).toBe('1');
      });
    }
  );
});
