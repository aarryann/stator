import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-html directives vitest tests', () => {
  test(
    'renders raw HTML using x-html',
    html`<div x-data='{ "rawHTML": "<span>Rendered</span>" }'>
      <p x-html="rawHTML"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const renderedSpan = get('p span');
      expect(renderedSpan).not.toBeNull();
      expect(renderedSpan.textContent).toBe('Rendered');
    }
  );
});
