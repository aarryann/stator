import { describe, expect, afterEach, beforeAll, vi } from 'vitest';
import { parse } from '../../../packages/statorjs/src/utils/evalsandbox';
import { test, html } from '../utils';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Stator eval utils vitest tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js

  test('Test evalsandbox parser for json objects', undefined, undefined, () => {
    let scope = {};
    let expression = '{"count": 1}';
    let evaluatedExpression = parse(expression)(scope);
    expect(evaluatedExpression.count).toBe(1);

    expression = '{ "items": ["One", "Two", "Three"] }';
    evaluatedExpression = parse(expression)(scope);
    expect(evaluatedExpression.items.length).toBe(3);
  });

  test(
    'Test evalsandbox parser for interpolation',
    html`<div x-data='{ "name": "Jack Ryan", "age": 23 }'>
      <p x-text="\`Hello, \${name}! You are \${age} years old.\`"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const element = get('p');
      expect(element.textContent).toBe('Hello, Jack Ryan! You are 23 years old.');
    }
  );
});
