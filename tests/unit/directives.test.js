import { describe, expect, afterEach, beforeAll, vi } from 'vitest';

import { fireEvent } from '@testing-library/vue';
import { parse } from '../../packages/statorjs/src/utils/evalsandbox';
import { test, html } from '../utils';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Stator.js Directives Tests', () => {
  /// TODO: Test stator:init, initializing and initialized from lifecycle.js

  test('x-data: test ngparser for object array', undefined, undefined, () => {
    let scope = {};
    let expression = '{"count": 1}';
    let evaluatedExpression = parse(expression)(scope);
    expect(evaluatedExpression.count).toBe(1);

    expression = '{ "items": ["One", "Two", "Three"] }';
    evaluatedExpression = parse(expression)(scope);
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
    undefined,
    ({ get }) => {
      const bazSpan = get('#bazSpan');
      const barSpan = get('#barSpan');
      expect(barSpan.textContent).toBe('bar');
      expect(bazSpan.textContent).toBe('goo');
    }
  );

  test('x-data initializes correctly and binds data to the DOM', html`<div x-data='{ "foo": "bar" }'><span x-text="foo"></span></div>`, undefined, ({ get, t }) => {
    const span = get('span');
    expect(span.textContent).toBe('bar');
  });

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
    'test ngparser interpolation',
    html`<div x-data='{ "name": "Jack Ryan", "age": 23 }'>
      <p x-text="\`Hello, \${name}! You are \${age} years old.\`"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const element = get('p');
      expect(element.textContent).toBe('Hello, Jack Ryan! You are 23 years old.');
    }
  );
  test(
    'x-show toggles element visibility',
    html`<div x-data='{ "visible": true }'>
      <p x-show="visible">Visible</p>
    </div>`,
    undefined,
    ({ get }) => {
      const paragraph = get('p');
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
    undefined,
    ({ get }) => {
      const paragraph = get('p');
      expect(paragraph).not.toBeNull();
    }
  );
  test(
    'x-init runs initialization expressions',
    html`<div x-data='{ "foo": "bar" }' x-init='foo = "baz"'>
      <p x-text="foo"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const paragraph = get('p');
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
    undefined,
    ({ get }) => {
      const button = get('button');
      button.click();

      expect(get('[x-data]')._x_dataStack[0].submitted).toBe(true);
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
  test(
    'clicking a button to toggle visibility',
    html`<div x-data="{ isOpen: false }">
      <button @click="isOpen = !isOpen">Click Me</button>
      <span x-show="isOpen"></span>
    </div>`,
    undefined,
    async ({ get, waitFor }) => {
      const span = get('span');
      const button = get('button');

      expect(span.style.display).toEqual('none');
      button.click();
      await waitFor(() => {
        expect(span.style.display).toEqual('none');
      });
    }
  );

  test(
    'resolves DOM elements using $refs',
    html`<div x-data>
      <button x-ref="myButton">Click Me</button>
      <p x-text="$refs.myButton.textContent"></p>
    </div>`,
    undefined,
    ({ get }) => {
      const paragraph = get('p');
      expect(paragraph.textContent).toBe('Click Me');
    }
  );

  test('debounces function calls', null, async ({ Stator }) => {
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
    undefined,
    ({ get, a }) => {
      const paragraphs = get(a`p`);
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
    undefined,
    ({ get, t }) => {
      const id = get('p').textContent;
      expect(id).toContain('unique');
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

  test(
    'handles modeleable transformations',
    html`<div x-data="{ number: 5 }">
      <div x-data="{ count: 0 }" x-modelable="count" x-model="number">
        <button @click="count=count+1">Increment</button>
      </div>
      Number: <span id="displayNumber" x-text="number"></span>
    </div> `,
    undefined,
    async ({ get, waitFor }) => {
      const button = get('button');
      const span = get('#displayNumber');

      /// TODO - Fix modelable
      expect(span.textContent).toBe('5');
      button.click();
      await waitFor(() => {
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
    undefined,
    ({ get, a }) => {
      const paragraphs = get(a`p`);
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

  test(
    'x-model two-way binds input fields',
    html`<div x-data='{ "inputValue": "" }'>
      <input x-model="inputValue" />
      <p x-text="inputValue"></p>
    </div>`,
    undefined,
    async ({ get, waitFor }) => {
      const input = get('input');
      const output = get('p');

      fireEvent.update(input, 'Hello Stator!!');
      await waitFor(() => {
        expect(output.textContent).toBe('Hello Stator!!');
      });
    }
  );

  test(
    'x-transition applies transitions on show/hide',
    html`<div x-data='{ "visible": false }'>
      <p x-show="visible" x-transition>Transition Content</p>
      <button @click="visible = !visible;">Toggle</button>
    </div>`,
    undefined,
    async ({ get, waitFor, Stator }) => {
      const paragraph = get('p');
      const button = get('button');

      expect(paragraph.style.display).toBe('none');
      button.click();
      await waitFor(() => {
        expect(paragraph.style.display).not.toBe('none');
      });
    }
  );

  test(
    'handles class string transformations',
    html`
      <div x-data>
        <button @click="$store.test.increment()">Increment</button>
        <span x-text="$store.test.count"></span>
      </div>
      <script>
        document.addEventListener('stator:init', () => {
          Stator.store('test', {
            count: 0,
            increment() {
              this.count++;
            }
          });
        });
      </script>
    `,
    ({ Stator }) => {
      Stator.store('test', {
        count: 0,
        increment() {
          this.count++;
        }
      });
    },
    async ({ waitFor }) => {
      const button = document.querySelector('button');
      const span = document.querySelector('span');

      expect(span.textContent).toBe('0');
      button.click();
      //await new Promise(r => setTimeout(r, 10));
      await waitFor(() => {
        expect(span.textContent).toBe('1');
      });
    }
  );
});
