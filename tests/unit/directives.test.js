import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import Stator from '../../packages/statorjs/src/index';
import { render, fireEvent, screen } from '@testing-library/vue';

// Mock the startObservingMutations function
/*
vi.mock('../../packages/statorjs/src/mutation', async () => {
  const originalModule = await vi.importActual('../../packages/statorjs/src/mutation'); // Import actual exports

  return {
    ...originalModule, // Include all original exports
    startObservingMutations: vi.fn(() => {}) // Mock this specific function
  };
});
*/
function mountHTML(html, data = {}, postTreeCallback = () => {}) {
  document.body.innerHTML = html;
  //Stator.data('testComponent', () => data);
  Stator.initTree(document.body.firstChild, undefined, undefined, postTreeCallback);
}
beforeAll(() => {
  // Setup before each describe
  document.body.innerHTML = '<div></div>';
  Stator.start();
});

beforeEach(() => {
  // Clean up DOM before each test
  Stator.destroyTree(document.body.firstChild);
  document.body.innerHTML = '';
});

describe('Stator.js Directives Tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js
  it('x-data initializes correctly and binds data to the DOM', () => {
    mountHTML(`<div x-data='{ "foo": "bar" }'><span x-text="foo"></span></div>`);
    const span = document.querySelector('span');
    expect(span.textContent).toBe('bar');
  });

  it('x-bind dynamically binds attributes', () => {
    mountHTML(
      `<div x-data='{ "color": "red" }'>
         <p x-bind:style="'color: ' + color">Test</p>
       </div>`
    );
    const element = document.querySelector('p');
    expect(element.style.color).toBe('red');
  });

  it('x-on handles events', async () => {
    mountHTML(
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
    mountHTML(
      `<div x-data="{ inputValue: '' }">
         <input x-model="inputValue">
         <p x-text="inputValue"></p>
       </div>`
    );
    const input = document.querySelector('input');
    const output = document.querySelector('p');

    await fireEvent.update(input, 'Hello Stator!');
    expect(output.textContent).toBe('Hello Stator!');
  });

  it('x-show toggles element visibility', () => {
    mountHTML(
      `<div x-data="{ visible: true }">
         <p x-show="visible">Visible</p>
       </div>`
    );
    const paragraph = document.querySelector('p');
    expect(paragraph.style.display).not.toBe('none');
  });

  it('x-if renders and destroys elements', () => {
    mountHTML(
      `<div x-data="{ show: true }">
         <template x-if="show">
           <p>Conditionally Rendered</p>
         </template>
       </div>`
    );

    const paragraph = document.body.querySelector('p');
    expect(paragraph).not.toBeNull();
  });

  it('x-for loops through arrays', () => {
    mountHTML(
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

  it('x-init runs initialization expressions', () => {
    mountHTML(
      `<div x-data="{ foo: 'bar' }" x-init="foo = 'baz'">
         <p x-text="foo"></p>
       </div>`
    );
    const paragraph = document.querySelector('p');
    expect(paragraph.textContent).toBe('baz');
  });

  it('x-on with .prevent stops default action', async () => {
    mountHTML(
      `<div x-data="{ submitted: false }">
         <form @submit.prevent="submitted = true">
           <button type="submit">Submit</button>
         </form>
       </div>`
    );
    const button = document.querySelector('button');
    await fireEvent.click(button);
    expect(document.querySelector('[x-data]')._x_dataStack[0].submitted).toBe(true);
  });

  /*
  it('x-transition applies transitions on show/hide', async () => {
    mountHTML(
      `<div x-data="{ visible: false }">
         <p x-show="visible" x-transition>Transition Content</p>
         <button @click="visible = !visible">Toggle</button>
       </div>`
    );

    const paragraph = document.querySelector('p');
    const button = document.querySelector('button');

    expect(paragraph.style.display).toBe('none');
    await fireEvent.click(button);
    expect(paragraph.style.display).not.toBe('none');
  });
  */
  /*
  it('x-cloak is removed on initialization', () => {
    mountHTML(`<div x-data x-cloak><p>Content</p></div>`);
    const element = document.querySelector('[x-cloak]');
    expect(element).toBeNull();
  });
  */

  it('Nested x-for loops render correctly', () => {
    mountHTML(
      `<div x-data="{ lists: [{ items: ['A', 'B'] }, { items: ['C', 'D'] }] }">
         <template x-for="list in lists">
           <div>
             <template x-for="item in list.items">
               <p x-text="item"></p>
             </template>
           </div>
         </template>
       </div>`
    );

    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBe(4);
    expect(paragraphs[0].textContent).toBe('A');
    expect(paragraphs[1].textContent).toBe('B');
    expect(paragraphs[2].textContent).toBe('C');
    expect(paragraphs[3].textContent).toBe('D');
  });

  /*
  it('stator:init is called during initialization', () => {
    const spy = vi.fn();
    mountHTML(`<div x-data="{ foo: 'bar' }" stator:init="spy()"></div>`, { spy });
    expect(spy).toHaveBeenCalled();
  });
  */
});
