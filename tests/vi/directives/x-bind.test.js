import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-bind directives vitest tests', () => {
  test(
    'x-bind dynamically binds attributes',
    html`<div x-data='{ "color": "red" }'>
      <p x-bind:style="\`color: \${color}\`">Test</p>
    </div>`,
    undefined,
    ({ get }) => {
      const element = get('p');
      expect(element.style.color).toBe('red');
    }
  );

  test(
    'binds a value to a DOM element correctly',
    html`<div x-data='{ "color": "blue" }'>
      <p x-bind:style="'color: ' + color"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const element = get('p');
      expect(element.style.color).toBe('blue');
    }
  );

  test(
    'handles complex attribute bindings',
    html`<div x-data="{ attrs: { 'data-test': 'value', class: 'test', style: 'color: red' } }">
      <div x-bind="attrs"></div>
    </div> `,
    undefined,
    ({ get, t }) => {
      const div = get('[x-bind]');
      expect(div.dataset.test).toBe('value');
      expect(div.classList.contains('test')).toBe(true);
      expect(div.style.color).toBe('red');
    }
  );
});
