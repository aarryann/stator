import { describe, it, expect, beforeEach } from 'vitest';
import Stator from '../../packages/statorjs/src/index';
import { render, fireEvent, screen } from '@testing-library/vue';

function mountWithAlpine(html, data = {}) {
  document.body.innerHTML = html;
  Stator.data('testComponent', () => data);
  Stator.start();
}

describe('AlpineJS-like Framework - Basic Functionality', () => {
  it('should initialize x-data and bind data to the DOM', () => {
    // Create a simple DOM structure
    document.body.innerHTML = `
      <div x-data='{ "message": "Hello, world!!" }'>
        <span x-text="message"></span>
      </div>
    `;

    // Initialize the framework
    Stator.start();

    // Verify if the data has been bound correctly
    const span = document.querySelector('span');
    expect(span.textContent).toBe('Hello, world!!');
  });
});

describe('Alpine.js Directives Tests', () => {
  beforeEach(() => {
    // Clean up DOM before each test
    document.body.innerHTML = '';
  });

  it('x-data initializes correctly', () => {
    mountWithAlpine(`<div x-data="{ foo: 'bar' }">{{ foo }}</div>`);
    expect(document.body.innerHTML).toContain('bar');
  });

  it('x-bind dynamically binds attributes', () => {
    mountWithAlpine(
      `<div x-data="{ color: 'red' }">
         <p x-bind:style="'color: ' + color">Test</p>
       </div>`
    );
    const element = document.querySelector('p');
    expect(element.style.color).toBe('red');
  });

  it('x-on handles events', async () => {
    mountWithAlpine(
      `<div x-data="{ count: 0 }">
         <button x-on:click="count++">Click</button>
         <span x-text="count"></span>
       </div>`,
      { count: 0 }
    );
    const button = document.querySelector('button');
    const span = document.querySelector('span');

    expect(span.textContent).toBe('0');

    await fireEvent.click(button);
    expect(span.textContent).toBe('1');
  });

  it('x-model two-way binds input fields', async () => {
    mountWithAlpine(
      `<div x-data="{ inputValue: '' }">
         <input x-model="inputValue">
         <p x-text="inputValue"></p>
       </div>`
    );
    const input = document.querySelector('input');
    const output = document.querySelector('p');

    await fireEvent.update(input, 'Hello Alpine!');
    expect(output.textContent).toBe('Hello Alpine!');
  });

  it('x-show toggles element visibility', () => {
    mountWithAlpine(
      `<div x-data="{ visible: true }">
         <p x-show="visible">Visible</p>
       </div>`
    );
    const paragraph = document.querySelector('p');
    expect(paragraph.style.display).not.toBe('none');
  });

  it('x-if renders and destroys elements', () => {
    mountWithAlpine(
      `<div x-data="{ show: true }">
         <template x-if="show">
           <p>Conditionally Rendered</p>
         </template>
       </div>`
    );
    const paragraph = document.querySelector('p');
    expect(paragraph).not.toBeNull();
  });

  it('x-for loops through arrays', () => {
    mountWithAlpine(
      `<div x-data="{ items: ['One', 'Two', 'Three'] }">
         <template x-for="item in items">
           <p x-text="item"></p>
         </template>
       </div>`
    );
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0].textContent).toBe('One');
    expect(paragraphs[1].textContent).toBe('Two');
    expect(paragraphs[2].textContent).toBe('Three');
  });
});