import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
import Stator from '../../packages/statorjs/src/index';
//import Stator from 'alpinejs';
import waitFor from 'wait-for-expect';
import { fireEvent } from '@testing-library/vue';
import { parse } from '../../packages/statorjs/src/utils/evalsandbox';
import { test, html } from '../utils';

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
  if (Stator.restart) Stator.restart();
  else Stator.start();
}

function evalSandboxed(expression, scope) {
  try {
    return parse(expression)(scope);
  } catch (e) {
    throw new Error(expression, e);
  }
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Stator.js Directives Tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js

  it('x-data: test ngparser for object array', () => {
    let scope = {};
    let expression = '{"count": 1}';
    let evaluatedExpression = evalSandboxed(expression, scope);
    expect(evaluatedExpression.count).toBe(1);

    expression = '{ "items": ["One", "Two", "Three"] }';
    evaluatedExpression = evalSandboxed(expression, scope);
    expect(evaluatedExpression.items.length).toBe(3);
  });

  test(
    'x-data test',
    html`<div x-data='{ "foo": "bar", "count":1 }'>
      <div x-data='{ "baz": "goo" }'>
        <div x-data='{ "foo": baz }'>
          <span id="bazSpan" x-text="foo">1</span>
        </div>
      </div>
      <span id="barSpan" x-text="foo">2</span>
    </div>`,
    ({ get, t }) => {
      const bazSpan = get('#bazSpan');
      const barSpan = get('#barSpan');
      expect(barSpan.textContent).toBe('bar');
      expect(bazSpan.textContent).toBe('goo');
    }
  );

  test('x-data initializes correctly and binds data to the DOM', html`<div x-data='{ "foo": "bar" }'><span x-text="foo"></span></div>`, ({ get, t }) => {
    const span = document.querySelector('span');
    expect(span.textContent).toBe('bar');
  });

  test(
    'x-bind dynamically binds attributes',
    html`<div x-data='{ "color": "red" }'>
      <p x-bind:style="\`color: \${color}\`">Test</p>
    </div>`,
    ({ get, t }) => {
      const element = document.querySelector('p');
      expect(element.style.color).toBe('red');
    }
  );

  test(
    'test ngparser interpolation',
    html`<div x-data='{ "name": "Jack Ryan", "age": 23 }'>
      <p x-text="\`Hello, \${name}! You are \${age} years old.\`"></p>
    </div>`,
    ({ get, t }) => {
      const element = document.querySelector('p');
      expect(element.textContent).toBe('Hello, Jack Ryan! You are 23 years old.');
    }
  );
  test(
    'x-show toggles element visibility',
    html`<div x-data='{ "visible": true }'>
      <p x-show="visible">Visible</p>
    </div>`,
    ({ get, t }) => {
      const paragraph = document.querySelector('p');
      expect(paragraph.style.display).not.toBe('none');
    }
  );

  test(
    'x-if renders and destroys elements',
    html`<div x-data='{ "show": true }'>
      <template x-if="show">
        <p>Conditionally Rendered</p>
      </template>
    </div>`,
    ({ get, t }) => {
      const paragraph = document.body.querySelector('p');
      expect(paragraph).not.toBeNull();
    }
  );
  test(
    'x-init runs initialization expressions',
    html`<div x-data='{ "foo": "bar" }' x-init='foo = "baz"'>
      <p x-text="foo"></p>
    </div>`,
    ({ get, t }) => {
      const paragraph = document.querySelector('p');
      expect(paragraph.textContent).toBe('baz');
    }
  );
  test(
    'x-on with .prevent stops default action',
    html`<div x-data='{ "submitted": false }'>
      <form @submit.prevent="submitted = true">
        <button type="submit">Submit</button>
      </form>
    </div>`,
    ({ get, t }) => {
      const button = document.querySelector('button');
      button.click();

      expect(document.querySelector('[x-data]')._x_dataStack[0].submitted).toBe(true);
    }
  );
  test(
    'binds a value to a DOM element correctly',
    html`<div x-data='{ "color": "blue" }'>
      <p x-bind:style="'color: ' + color"></p>
    </div>`,
    ({ get, t }) => {
      const element = document.querySelector('p');
      expect(element.style.color).toBe('blue');
    }
  );

  test(
    'renders raw HTML using x-html',
    html`<div x-data='{ "rawHTML": "<span>Rendered</span>" }'>
      <p x-html="rawHTML"></p>
    </div>`,
    ({ get, t }) => {
      const renderedSpan = document.querySelector('p span');
      expect(renderedSpan).not.toBeNull();
      expect(renderedSpan.textContent).toBe('Rendered');
    }
  );
  test(
    'clicking a button to toggle visibility',
    html`<div x-data="{ isOpen: false }">
      <button @click="isOpen = !isOpen">Click Me</button>
      <span x-show="isOpen"></span>
    </div>`,
    ({ get, t }) => {
      expect(document.querySelector('span').style.display).toEqual('none');
      const button = document.querySelector('button');
      button.click();
      waitFor(() => {
        expect(document.querySelector('span').style.display).toEqual('none');
      });
    }
  );

  test(
    'resolves DOM elements using $refs',
    html`<div x-data>
      <button x-ref="myButton">Click Me</button>
      <p x-text="$refs.myButton.textContent"></p>
    </div>`,
    ({ get, t }) => {
      const paragraph = document.querySelector('p');
      expect(paragraph.textContent).toBe('Click Me');
    }
  );

  it('debounces function calls', async () => {
    let count = 0;
    const debounced = Stator.debounce(() => count++, 100);
    debounced();
    debounced();
    await new Promise(r => setTimeout(r, 150));
    expect(count).toBe(1);
  });

  test(
    'x-for loops through arrays',
    html`<div x-data='{ "items": ["One", "Two", "Three"] }'>
      <template x-for="item in items">
        <p x-text="item"></p>
      </template>
    </div>`,
    ({ get, t }) => {
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0].textContent).toBe('One');
      expect(paragraphs[1].textContent).toBe('Two');
      expect(paragraphs[2].textContent).toBe('Three');
    }
  );

  test(
    'generates unique IDs using $id',
    html`<div x-data="{ id: $id('unique') }">
      <p x-text="id"></p>
    </div>`,
    ({ get, t }) => {
      const id = document.querySelector('p').textContent;
      expect(id).toContain('unique');
    }
  );

  test(
    'handles complex attribute bindings',
    html`<div x-data="{ attrs: { 'data-test': 'value', class: 'test', style: 'color: red' } }">
      <div x-bind="attrs"></div>
    </div> `,
    ({ get, t }) => {
      const div = document.querySelector('[x-bind]');
      expect(div.dataset.test).toBe('value');
      expect(div.classList.contains('test')).toBe(true);
      expect(div.style.color).toBe('red');
    }
  );

  test(
    'handles modeleable transformations',
    html`<div x-data="{ number: 5 }">
      <div x-data="{ count: 0 }" x-modelable="count" x-model="number">
        <button @click="count=count+1">Increment</button>
      </div>
      Number: <span id="displayNumber" x-text="number"></span>
    </div> `,
    ({ get, t }) => {
      const button = document.querySelector('button');
      const span = document.querySelector('#displayNumber');

      button.click();
      waitFor(() => {
        expect(span.textContent).toBe('5');
      });
    }
  );

  test(
    'Nested x-for loops render correctly',
    html`<div x-data='{ "lists": [{ "items": ["A", "B"] }, { "items": ["C", "D"] }] }'>
      <template x-for="list in lists">
        <div>
          <template x-for="item in list.items">
            <p x-text="item"></p>
          </template>
        </div>
      </template>
    </div>`,
    ({ get, t }) => {
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs.length).toBe(4);
      expect(paragraphs[0].textContent).toBe('A');
      expect(paragraphs[1].textContent).toBe('B');
      expect(paragraphs[2].textContent).toBe('C');
      expect(paragraphs[3].textContent).toBe('D');
    }
  );

  test(
    'x-on handles events',
    html`<div x-data='{ "count": 0 }'>
      <button x-on:click="count=count+1">Click</button>
      <span x-text="count"></span>
    </div>`,
    ({ get, t }) => {
      const button = document.querySelector('button');
      const span = document.querySelector('span');

      expect(span.textContent).toBe('0');

      button.click();
      waitFor(() => {
        expect(span.textContent).toBe('1');
      });
    }
  );

  test(
    'x-model two-way binds input fields',
    html`<div x-data='{ "inputValue": "" }'>
      <input x-model="inputValue" />
      <p x-text="inputValue"></p>
    </div>`,
    ({ get, t }) => {
      const input = document.querySelector('input');
      const output = document.querySelector('p');

      fireEvent.update(input, 'Hello Stator!');
      waitFor(() => {
        expect(output.textContent).toBe('Hello Stator!');
      });
    }
  );

  test(
    'x-transition applies transitions on show/hide',
    html`<div x-data='{ "visible": false }'>
      <p x-show="visible" x-transition>Transition Content</p>
      <button @click="visible = !visible;">Toggle</button>
    </div>`,
    ({ get, t }) => {
      const paragraph = document.querySelector('p');
      const button = document.querySelector('button');

      expect(paragraph.style.display).toBe('none');
      button.click();
      waitFor(() => {
        expect(paragraph.style.display).not.toBe('none');
      });
    }
  );

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
});
