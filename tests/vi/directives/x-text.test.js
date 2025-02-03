import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { test, html } from '../utils';

describe('Stator x-text directives vitest tests', () => {
  test('x-data initializes correctly and binds data to the DOM', html`<div x-data='{ "foo": "bar" }'><span x-text="foo"></span></div>`, undefined, ({ get, t }) => {
    const span = get('span');
    expect(span.textContent).toBe('bar');
  });
});
