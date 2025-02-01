import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import Stator from '../../packages/statorjs/src/index';
//import Stator from 'alpinejs';
import waitFor from 'wait-for-expect';
import { parse } from '../../packages/statorjs/src/utils/evalparser';
import { toJson } from '../../packages/statorjs/src/utils/toJson';

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
function mountHTML(html, data = {}) {
  document.body.innerHTML = html;
  Stator.restart();
  //Stator.start();
}

beforeAll(() => {
  document.body.innerHTML = '<div></div>';
  Stator.start();
});

beforeEach(() => {
  Stator.destroyTree(document.body);
  document.body.innerHTML = '';
});

describe('Stator.js Directives Tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js

  it('x-data: test ngparser for object array', () => {
    const scope = {};
    const expression = '{"count": 1}';
    let evaluatedExpression;
    if (expression.startsWith('{')) {
      evaluatedExpression = toJson(expression, scope);
    } else {
      evaluatedExpression = parse(expression)(scope);
    }

    console.log(evaluatedExpression);
    expect(JSON.stringify(evaluatedExpression)).toBe('{"count":1}');
  });
  /*
  it('x-data nesting test', () => {
    mountHTML(`
    <div x-data='{ "foo": "bar", "count":1 }'>
      <div x-data='{ "baz": "goo" }'>
        <div x-data='{ "foo": baz }'>
          <span id="bazSpan" x-text="foo">1</span>
        </div>
      </div>
      <span id="barSpan" x-text="foo">2</span>
    </div>`);

    const bazSpan = document.querySelector('#bazSpan');
    const barSpan = document.querySelector('#barSpan');
    expect(barSpan.textContent).toBe('bar');
    expect(bazSpan.textContent).toBe('goo');
  });

  it('x-data initializes correctly and binds data to the DOM', () => {
    mountHTML(`<div x-data='{ "foo": "bar" }'><span x-text="foo"></span></div>`);
    const span = document.querySelector('span');
    expect(span.textContent).toBe('bar');
  });

  it('x-bind dynamically binds attributes', () => {
    mountHTML(
      `<div x-data='{ "color": "red" }'>
         <p x-bind:style="\`color: \${color}\`">Test</p>
       </div>`
    );
    const element = document.querySelector('p');
    expect(element.style.color).toBe('red');
  });

  it('test ngparser interpolation', () => {
    mountHTML(
      `<div x-data='{ "name": "Jack Ryan", "age": 23 }'>
         <p x-text="\`Hello, \${name}! You are \${age} years old.\`"></p>
       </div>`
    );
    const element = document.querySelector('p');
    expect(element.textContent).toBe('Hello, Jack Ryan! You are 23 years old.');
  });
  it('x-show toggles element visibility', () => {
    mountHTML(
      `<div x-data='{ "visible": true }'>
         <p x-show="visible">Visible</p>
       </div>`
    );
    const paragraph = document.querySelector('p');
    expect(paragraph.style.display).not.toBe('none');
  });

  it('x-if renders and destroys elements', () => {
    mountHTML(
      `<div x-data='{ "show": true }'>
         <template x-if="show">
           <p>Conditionally Rendered</p>
         </template>
       </div>`
    );

    const paragraph = document.body.querySelector('p');
    expect(paragraph).not.toBeNull();
  });
  it('x-init runs initialization expressions', () => {
    mountHTML(
      `<div x-data='{ "foo": "bar" }' x-init='foo = "baz"'>
         <p x-text="foo"></p>
       </div>`
    );
    const paragraph = document.querySelector('p');
    expect(paragraph.textContent).toBe('baz');
  });
  it('x-on with .prevent stops default action', async () => {
    mountHTML(
      `<div x-data='{ "submitted": false }'>
         <form @submit.prevent="submitted = true">
           <button type="submit">Submit</button>
         </form>
       </div>`
    );
    const button = document.querySelector('button');
    await document.querySelector('button').click();

    expect(document.querySelector('[x-data]')._x_dataStack[0].submitted).toBe(true);
  });
  it('binds a value to a DOM element correctly', () => {
    mountHTML(
      `<div x-data='{ "color": "blue" }'>
         <p x-bind:style="'color: ' + color"></p>
       </div>`
    );
    const element = document.querySelector('p');
    expect(element.style.color).toBe('blue');
  });

  it('renders raw HTML using x-html', () => {
    mountHTML(
      `<div x-data='{ "rawHTML": "<span>Rendered</span>" }'>
         <p x-html="rawHTML"></p>
       </div>`
    );
    const renderedSpan = document.querySelector('p span');
    expect(renderedSpan).not.toBeNull();
    expect(renderedSpan.textContent).toBe('Rendered');
  });
  it('clicking a button to toggle visibility', async () => {
    mountHTML(`<div x-data="{ isOpen: false }">
      <button @click="isOpen = !isOpen">Click Me</button>
      <span x-show="isOpen"></span>
    </div>`);
    expect(document.querySelector('span').style.display).toEqual('none');
    const button = document.querySelector('button');
    button.click();
    await waitFor(() => {
      expect(document.querySelector('span').style.display).toEqual('none');
    });
  });

  it('resolves DOM elements using $refs', () => {
    mountHTML(
      `<div x-data>
         <button x-ref="myButton">Click Me</button>
         <p x-text="$refs.myButton.textContent"></p>
       </div>`
    );
    const paragraph = document.querySelector('p');
    expect(paragraph.textContent).toBe('Click Me');
  });

  it('debounces function calls', async () => {
    let count = 0;
    const debounced = Stator.debounce(() => count++, 100);
    debounced();
    debounced();
    await new Promise(r => setTimeout(r, 150));
    expect(count).toBe(1);
  });
*/
  /*********** 
  it('x-for loops through arrays', () => {
    mountHTML(
      `<div x-data='{ "items": ["One", "Two", "Three"] }'>
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
  */
  /*
  it('generates unique IDs using $id', () => {
    mountHTML(
      `<div x-data="{ id: $id('unique') }">
         <p x-text="id"></p>
       </div>`
    );
    const id = document.querySelector('p').textContent;
    expect(id).toContain('unique');
  });

  it('handles complex attribute bindings', () => {
    mountHTML(`
        <div x-data="{ attrs: { 'data-test': 'value', class: 'test', style: 'color: red' } }">
          <div x-bind="attrs"></div>
        </div>
      `);

    const div = document.querySelector('[x-bind]');
    expect(div.dataset.test).toBe('value');
    expect(div.classList.contains('test')).toBe(true);
    expect(div.style.color).toBe('red');
  });

  it('handles modeleable transformations', async () => {
    mountHTML(`
      <div x-data="{ number: 5 }">
        <div x-data="{ count: 0 }" x-modelable="count" x-model="number">
          <button @click="count++">Increment</button>
        </div>
        Number: <span id="displayNumber" x-text="number"></span>
      </div>
      `);
    const button = document.querySelector('button');
    const span = document.querySelector('#displayNumber');

    await fireEvent.click(button);
    await new Promise(r => setTimeout(r, 100));
    expect(span.textContent).toBe('5');
  });
  
  it('Nested x-for loops render correctly', () => {
    mountHTML(
      `<div x-data='{ "lists": [{ "items": ["A", "B"] }, { "items": ["C", "D"] }] }'>
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
  it('x-on handles events', async () => {
    mountHTML(
      `<div x-data='{ "count": 0 }'>
         <button x-on:click="count=count+1">Click</button>
         <span x-text="count"></span>
       </div>`
    );
    const button = document.querySelector('button');
    const span = document.querySelector('span');

    expect(span.textContent).toBe('0');

    await fireEvent.click(button);
    expect(span.textContent).toBe('0');
  });
  
  it('x-model two-way binds input fields', async () => {
    mountHTML(
      `<div x-data='{ "inputValue": "" }'>
         <input x-model="inputValue">
         <p x-text="inputValue"></p>
       </div>`
    );
    const input = document.querySelector('input');
    const output = document.querySelector('p');

    await fireEvent.update(input, 'Hello Stator!');
    expect(output.textContent).toBe('Hello Stator!');
  });
  it('x-transition applies transitions on show/hide', async () => {
    mountHTML(
      `<div x-data='{ "visible": false }'>
         <p x-show="visible" x-transition>Transition Content</p>
         <button @click="visible = !visible; i=i+1;">Toggle</button>
       </div>`
    );

    const paragraph = document.querySelector('p');
    const button = document.querySelector('button');

    expect(paragraph.style.display).toBe('none');
    await fireEvent.click(button);
    await new Promise(r => setTimeout(r, 20)); // Adjust timeout to match transition duration
    expect(paragraph.style.display).not.toBe('none');
  });
  it('handles class string transformations', async () => {
    Stator.store('test', {
      count: 0,
      increment() {
        this.count++;
      }
    });
    mountHTML(`
      <div x-data>
        <button @click="$store.test.increment()">Increment</button>
        <span x-text="$store.test.count"></span>
      </div>
    `);

    const button = document.querySelector('button');
    const span = document.querySelector('span');

    button.click();
    await new Promise(r => setTimeout(r, 10));
    expect(span.textContent).toBe('1');
  });
  */
});
