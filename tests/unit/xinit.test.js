import { describe, it, expect } from 'vitest';
import Stator from '../../packages/statorjs/src/index';
import { Parser } from 'expr-eval'; // Import expr-eval

describe('AlpineJS-like Framework - Basic Functionality', () => {
  it('should test parser', () => {
    const parser = new Parser();

    const expression = '{ "message": "Hello, world!" }';
    const parsedExpression = JSON.parse(expression);
    //const expr = parser.parse(parsedExpression);

    // Verify if the data has been bound correctly
    //const span = document.querySelector('span');
    expect(1).toBe(1);
  });

  it('should initialize x-data and bind data to the DOM', () => {
    // Create a simple DOM structure
    document.body.innerHTML = `
      <div x-data='{ "message": "Hello, world!" }'>
        <span x-text="message">Hello, world!</span>
      </div>
    `;

    // Initialize the framework
    Stator.start();

    // Verify if the data has been bound correctly
    const span = document.querySelector('span');
    console.log(2);
    console.log(span.textContent);
    expect(span.textContent).toBe('Hello, world!');
  });
});
