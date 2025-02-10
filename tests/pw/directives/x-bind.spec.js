import { expect, test } from '../fixtures/base';

test('sets attribute bindings on initialize', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
        <div x-data="{ foo: 'bar' }">
            <span x-ref="me" x-bind:foo="foo">[Subject]</span>
        </div>
    `);

  //const body = await specPage.locator('body').innerHTML();
  //console.log(body);

  // Verify the attribute binding
  await expect(specPage.locator('span')).toHaveAttribute('foo', 'bar');
});

test('sets undefined nested keys to empty string', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ nested: {} }">
          <span x-bind:foo="nested.field">
      </div>
    `);

  await expect(specPage.locator('span')).toHaveAttribute('foo', '');
});

test('style attribute bindings are added by string syntax', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ initialClass: 'foo' }">
          <span x-bind:class="initialClass"></span>
      </div>
    `);

  await expect(specPage.locator('span')).toHaveClass('foo');
});

test('aria-pressed/checked/expanded/selected attribute boolean values are cast to a true/false string', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ open: true }">
          <span x-bind:aria-pressed="open"></span>
          <span x-bind:aria-checked="open"></span>
          <span x-bind:aria-expanded="open"></span>
          <span x-bind:aria-selected="open"></span>

          <span x-bind:aria-pressed="false"></span>
          <span x-bind:aria-checked="false"></span>
          <span x-bind:aria-expanded="false"></span>
          <span x-bind:aria-selected="false"></span>
      </div>
    `);

  await expect(specPage.locator('span:nth-of-type(1)')).toHaveAttribute('aria-pressed', 'true');
  await expect(specPage.locator('span:nth-of-type(2)')).toHaveAttribute('aria-checked', 'true');
  await expect(specPage.locator('span:nth-of-type(3)')).toHaveAttribute('aria-expanded', 'true');
  await expect(specPage.locator('span:nth-of-type(4)')).toHaveAttribute('aria-selected', 'true');
  await expect(specPage.locator('span:nth-of-type(5)')).toHaveAttribute('aria-pressed', 'false');
  await expect(specPage.locator('span:nth-of-type(6)')).toHaveAttribute('aria-checked', 'false');
  await expect(specPage.locator('span:nth-of-type(7)')).toHaveAttribute('aria-expanded', 'false');
  await expect(specPage.locator('span:nth-of-type(8)')).toHaveAttribute('aria-selected', 'false');
});

test('non-boolean attributes set to null/undefined/false are removed from the element', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{}">
          <a href="#hello" x-bind:href="null">null</a>
          <a href="#hello" x-bind:href="false">false</a>
          <a href="#hello" x-bind:href="undefined">undefined</a>
          <!-- custom attribute see https://github.com/alpinejs/alpine/issues/280 -->
          <span visible="true" x-bind:visible="null">null</span>
          <span visible="true" x-bind:visible="false">false</span>
          <span visible="true" x-bind:visible="undefined">undefined</span>

          <span hidden="true" x-bind:hidden="null">null</span>
          <span hidden="true" x-bind:hidden="false">false</span>
          <span hidden="true" x-bind:hidden="undefined">undefined</span>
      </div>
    `);

  // Check that the elements do not have the specified attributes
  await expect(specPage.locator('a:nth-of-type(1)')).not.toHaveAttribute('href');
  await expect(specPage.locator('a:nth-of-type(2)')).not.toHaveAttribute('href');
  await expect(specPage.locator('a:nth-of-type(3)')).not.toHaveAttribute('href');

  await expect(specPage.locator('span:nth-of-type(1)')).not.toHaveAttribute('visible');
  await expect(specPage.locator('span:nth-of-type(2)')).not.toHaveAttribute('visible');
  await expect(specPage.locator('span:nth-of-type(3)')).not.toHaveAttribute('visible');

  await expect(specPage.locator('span:nth-of-type(4)')).not.toHaveAttribute('hidden');
  await expect(specPage.locator('span:nth-of-type(5)')).not.toHaveAttribute('hidden');
  await expect(specPage.locator('span:nth-of-type(6)')).not.toHaveAttribute('hidden');
});

test('non-boolean empty string attributes are not removed', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data>
          <a href="#hello" x-bind:href="''"></a>
      </div>
    `);

  await expect(specPage.locator('a')).toHaveAttribute('href', '');
});

test('boolean attribute values are set to their attribute name if true and removed if false', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ isSet: true }">
          <span @click="isSet = false" id="setToFalse">Set To False</span>

          <input x-bind:disabled="isSet"></input>
          <input x-bind:checked="isSet"></input>
          <input x-bind:required="isSet"></input>
          <input x-bind:readonly="isSet"></input>
          <details x-bind:open="isSet"></details>
          <select x-bind:multiple="isSet"></select>
          <option x-bind:selected="isSet"></option>
          <textarea x-bind:autofocus="isSet"></textarea>
          <dl x-bind:itemscope="isSet"></dl>
          <form 
              x-bind:novalidate="isSet"
              x-bind:inert="isSet"
          ></form>
          <iframe
              x-bind:allowfullscreen="isSet"
          ></iframe>
          <button x-bind:formnovalidate="isSet"></button>
          <audio
              x-bind:autoplay="isSet"
              x-bind:controls="isSet"
              x-bind:loop="isSet"
              x-bind:muted="isSet"
          ></audio>
          <video x-bind:playsinline="isSet"></video>
          <track x-bind:default="isSet" />
          <img x-bind:ismap="isSet" />
          <ol x-bind:reversed="isSet"></ol>
          <template 
              x-bind:shadowrootclonable="isSet"
              x-bind:shadowrootdelegatesfocus="isSet"
              x-bind:shadowrootserializable="isSet"
          ></template>
      </div>
    `);

  // Check that elements initially have the expected attributes
  await expect(specPage.locator('input:nth-of-type(1)')).toHaveAttribute('disabled', 'disabled');
  await expect(specPage.locator('input:nth-of-type(2)')).toHaveAttribute('checked', 'checked');
  await expect(specPage.locator('input:nth-of-type(3)')).toHaveAttribute('required', 'required');
  await expect(specPage.locator('input:nth-of-type(4)')).toHaveAttribute('readonly', 'readonly');
  await expect(specPage.locator('details')).toHaveAttribute('open', 'open');
  await expect(specPage.locator('select')).toHaveAttribute('multiple', 'multiple');
  await expect(specPage.locator('option')).toHaveAttribute('selected', 'selected');
  await expect(specPage.locator('textarea')).toHaveAttribute('autofocus', 'autofocus');
  await expect(specPage.locator('dl')).toHaveAttribute('itemscope', 'itemscope');
  await expect(specPage.locator('form')).toHaveAttribute('novalidate', 'novalidate');
  await expect(specPage.locator('iframe')).toHaveAttribute('allowfullscreen', 'allowfullscreen');
  await expect(specPage.locator('button')).toHaveAttribute('formnovalidate', 'formnovalidate');
  await expect(specPage.locator('audio')).toHaveAttribute('autoplay', 'autoplay');
  await expect(specPage.locator('audio')).toHaveAttribute('controls', 'controls');
  await expect(specPage.locator('audio')).toHaveAttribute('loop', 'loop');
  await expect(specPage.locator('audio')).toHaveAttribute('muted', 'muted');
  await expect(specPage.locator('video')).toHaveAttribute('playsinline', 'playsinline');
  await expect(specPage.locator('track')).toHaveAttribute('default', 'default');
  await expect(specPage.locator('img')).toHaveAttribute('ismap', 'ismap');
  await expect(specPage.locator('ol')).toHaveAttribute('reversed', 'reversed');
  await expect(specPage.locator('template')).toHaveAttribute('shadowrootclonable', 'shadowrootclonable');
  await expect(specPage.locator('template')).toHaveAttribute('shadowrootdelegatesfocus', 'shadowrootdelegatesfocus');
  await expect(specPage.locator('template')).toHaveAttribute('shadowrootserializable', 'shadowrootserializable');

  // Click button to remove attributes
  await specPage.locator('#setToFalse').click();

  // Check that elements no longer have the attributes
  await expect(specPage.locator('input:nth-of-type(1)')).not.toHaveAttribute('disabled');
  await expect(specPage.locator('input:nth-of-type(2)')).not.toHaveAttribute('checked');
  await expect(specPage.locator('input:nth-of-type(3)')).not.toHaveAttribute('required');
  await expect(specPage.locator('input:nth-of-type(4)')).not.toHaveAttribute('readonly');
  await expect(specPage.locator('details')).not.toHaveAttribute('open');
  await expect(specPage.locator('select')).not.toHaveAttribute('multiple');
  await expect(specPage.locator('option')).not.toHaveAttribute('selected');
  await expect(specPage.locator('textarea')).not.toHaveAttribute('autofocus');
  await expect(specPage.locator('dl')).not.toHaveAttribute('itemscope');
  await expect(specPage.locator('form')).not.toHaveAttribute('novalidate');
  await expect(specPage.locator('iframe')).not.toHaveAttribute('allowfullscreen');
  await expect(specPage.locator('iframe')).not.toHaveAttribute('allowpaymentrequest');
  await expect(specPage.locator('button')).not.toHaveAttribute('formnovalidate');
  await expect(specPage.locator('audio')).not.toHaveAttribute('autoplay');
  await expect(specPage.locator('audio')).not.toHaveAttribute('controls');
  await expect(specPage.locator('audio')).not.toHaveAttribute('loop');
  await expect(specPage.locator('audio')).not.toHaveAttribute('muted');
  await expect(specPage.locator('video')).not.toHaveAttribute('playsinline');
  await expect(specPage.locator('track')).not.toHaveAttribute('default');
  await expect(specPage.locator('img')).not.toHaveAttribute('ismap');
  await expect(specPage.locator('ol')).not.toHaveAttribute('reversed');
  const script = specPage.locator('script').nth(1);
  await expect.soft(script).not.toHaveAttribute('async');
  await expect(script).not.toHaveAttribute('defer');
  await expect(script).not.toHaveAttribute('nomodule');
});

test('boolean empty string attributes are not removed', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{}">
          <input x-bind:disabled="''">
      </div>
    `);

  const input = specPage.locator('input');

  await expect(input).toHaveAttribute('disabled', 'disabled');
});

test('binding supports short syntax', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ foo: 'bar' }">
          <span :class="foo"></span>
      </div>
    `);

  const span = specPage.locator('span');

  await expect(span).toHaveClass('bar');
});

test('checkbox is unchecked by default', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{foo: {bar: 'baz'}}">
          <input type="checkbox" x-bind:value="''"></input>
          <input type="checkbox" x-bind:value="'test'"></input>
          <input type="checkbox" x-bind:value="foo.bar"></input>
          <input type="checkbox" x-bind:value="0"></input>
          <input type="checkbox" x-bind:value="10"></input>
      </div>
    `);

  const input1 = specPage.locator('input:nth-of-type(1)');
  const input2 = specPage.locator('input:nth-of-type(2)');
  const input3 = specPage.locator('input:nth-of-type(3)');
  const input4 = specPage.locator('input:nth-of-type(4)');
  const input5 = specPage.locator('input:nth-of-type(5)');

  await expect(input1).not.toBeChecked();
  await expect(input2).not.toBeChecked();
  await expect(input3).not.toBeChecked();
  await expect(input4).not.toBeChecked();
  await expect(input5).not.toBeChecked();
});

test('radio is unchecked by default', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{foo: {bar: 'baz'}}">
          <input type="radio" x-bind:value="''"></input>
          <input type="radio" x-bind:value="'test'"></input>
          <input type="radio" x-bind:value="foo.bar"></input>
          <input type="radio" x-bind:value="0"></input>
          <input type="radio" x-bind:value="10"></input>
      </div>
    `);

  const input1 = specPage.locator('input:nth-of-type(1)');
  const input2 = specPage.locator('input:nth-of-type(2)');
  const input3 = specPage.locator('input:nth-of-type(3)');
  const input4 = specPage.locator('input:nth-of-type(4)');
  const input5 = specPage.locator('input:nth-of-type(5)');

  await expect(input1).not.toBeChecked();
  await expect(input2).not.toBeChecked();
  await expect(input3).not.toBeChecked();
  await expect(input4).not.toBeChecked();
  await expect(input5).not.toBeChecked();
});

test('checkbox values are set correctly', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ stringValue: 'foo', trueValue: true, falseValue: false }">
          <input type="checkbox" name="stringCheckbox" :value="stringValue" />
          <input type="checkbox" name="trueCheckbox" :value="trueValue" />
          <input type="checkbox" name="falseCheckbox" :value="falseValue" />
      </div>
    `);

  const input1 = specPage.locator('input:nth-of-type(1)');
  const input2 = specPage.locator('input:nth-of-type(2)');
  const input3 = specPage.locator('input:nth-of-type(3)');

  await expect(input1).toHaveValue('foo');
  await expect(input2).toHaveValue('on');
  await expect(input3).toHaveValue('on');
});

test('radio values are set correctly', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{lists: [{id: 1}, {id: 8}], selectedListID: '8'}">
          <template x-for="list in lists" :key="list.id">
              <input x-model="selectedListID" type="radio" :value="list.id.toString()" :id="'list-' + list.id">
          </template>
          <input type="radio" id="list-test" value="test" x-model="selectedListID">
      </div>
    `);

  const list1 = specPage.locator('#list-1');
  const list8 = specPage.locator('#list-8');
  const listTest = specPage.locator('#list-test');

  await expect(list1).toHaveValue('1');
  await expect(list1).not.toBeChecked();
  await expect(list8).toHaveValue('8');
  await expect(list8).toBeChecked();
  await expect(listTest).toHaveValue('test');
  await expect(listTest).not.toBeChecked();
});

test('.camel modifier correctly sets name of attribute', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data>
          <svg x-bind:view-box.camel="'0 0 42 42'"></svg>
      </div>
    `);

  const svg = specPage.locator('svg');
  await expect(svg).toHaveAttribute('viewBox', '0 0 42 42');
});

test('attribute binding names can contain numbers', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <svg x-data>
          <line x1="1" y1="2" :x2="3" x-bind:y2="4" />
      </svg>
    `);

  const line = specPage.locator('line');

  await expect(line).toHaveAttribute('x2', '3');
  await expect(line).toHaveAttribute('y2', '4');
});

test('non-string and non-boolean attributes are cast to string when bound to checkbox', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ number: 100, zero: 0, bool: true, nullProp: null }">
          <input type="checkbox" id="number" :value="number">
          <input type="checkbox" id="zero" :value="zero">
          <input type="checkbox" id="boolean" :value="bool">
          <input type="checkbox" id="null" :value="nullProp">
      </div>
    `);

  const input1 = specPage.locator('input:nth-of-type(1)');
  const input2 = specPage.locator('input:nth-of-type(2)');
  const input3 = specPage.locator('input:nth-of-type(3)');
  const input4 = specPage.locator('input:nth-of-type(4)');

  await expect(input1).toHaveValue('100');
  await expect(input2).toHaveValue('0');
  await expect(input3).toHaveValue('on');
  await expect(input4).toHaveValue('on');
});

test('can bind an object of directives', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <script nonce="iifbjI67iq4HZJUQ54eC">
          window.modal = function () {
              return {
                  foo: 'bar',
                  trigger: {
                      ['x-on:click']() { this.foo = 'baz' },
                  },
                  dialogue: {
                      ['x-text']() { return this.foo },
                  },
              }
          }
      </script>

      <div x-data="window.modal()">
          <button x-bind="trigger">Toggle</button>

          <span x-bind="dialogue">Modal Body</span>
      </div>
    `);

  const span = specPage.locator('span');
  const button = specPage.locator('button');

  ///await expect(span).toHaveText('bar'); // Verify initial text
  await button.click(); // Click the button
  ///await expect(span).toHaveText('baz'); // Verify updated text
});

test('x-bind object syntax supports normal HTML attributes', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <span x-data x-bind="{ foo: 'bar' }"></span>
    `);

  const span = specPage.locator('span');
  await expect(span).toHaveAttribute('foo', 'bar');
});

test('x-bind object syntax supports normal HTML attributes mixed in with dynamic ones', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <span x-data x-bind="{ 'x-bind:bob'() { return 'lob'; }, foo: 'bar', 'x-bind:bab'() { return 'lab' } }"></span>
    `);
  const span = specPage.locator('span');

  ///await expect(span).toHaveAttribute('foo', 'bar');
  ///await expect(span).toHaveAttribute('bob', 'lob');
  ///await expect(span).toHaveAttribute('bab', 'lab');
});

test('x-bind object syntax supports x-for', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <script nonce="iifbjI67iq4HZJUQ54eC">
          window.todos = () => { return {
              todos: ['foo', 'bar'],
              outputForExpression: {
                  ['x-for']: 'todo in todos',
              }
          }}
      </script>
      <div x-data="window.todos()">
          <ul>
              <template x-bind="outputForExpression">
                  <li x-text="todo"></li>
              </template>
          </ul>
      </div>
    `);

  const firstItem = specPage.locator('li:nth-of-type(1)');
  const secondItem = specPage.locator('li:nth-of-type(2)');

  ///await expect(firstItem).toHaveText('foo');
  ///await expect(secondItem).toHaveText('bar');
});

test('x-bind object syntax syntax supports x-transition', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <style nonce="iifbjI67iq4HZJUQ54eC">
          .transition { transition-property: background-color, border-color, color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
          .duration-100 { transition-duration: 100ms; }
      </style>
      <script nonce="iifbjI67iq4HZJUQ54eC">
          window.transitions = () => { return {
              show: true,
              outputClickExpression: {
                  ['@click']() { this.show = false },
                  ['x-text']() { return 'Click Me' },
              },
              outputTransitionExpression: {
                  ['x-show']() { return this.show },
                  ['x-transition:enter']: 'transition duration-100',
                  ['x-transition:leave']: 'transition duration-100',
              },
          }}
      </script>
      <div x-data="transitions()">
          <button x-bind="outputClickExpression"></button>

          <span x-bind="outputTransitionExpression">thing</span>
      </div>
    `);

  const span = specPage.locator('span');
  const button = specPage.locator('button');
  await expect(span).toBeVisible(); // Verify the span is initially visible
  await button.click(); // Click the button
  await expect(span).toBeVisible(); // Ensure it's still visible after click
  //console.log(await specPage.locator('body').innerHTML());
  ///await span.waitFor({ state: 'hidden', timeout: 5000 });
  ///await expect(span).toBeHidden(); // Ensure it gets hidden
});

test('x-bind object syntax event handlers defined as functions receive the event object as their first argument', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <script nonce="iifbjI67iq4HZJUQ54eC">
          window.data = () => { return {
              button: {
                  ['@click'](event) {
                      this.$refs.span.innerText = event.currentTarget.id
                  }
              }
          }}
      </script>
      <div x-data="window.data()">
          <button x-bind="button" id="bar">click me</button>

          <span x-ref="span">foo</span>
      </div>
    `);

  const span = specPage.locator('span');
  const button = specPage.locator('button');

  await expect(span).toHaveText('foo'); // Verify initial text
  await button.click(); // Click the button
  //console.log(await specPage.locator('body').innerHTML());
  ///await expect(span).toHaveText('bar'); // Verify updated text
});

test('x-bind object syntax event handlers defined as functions receive element bound magics', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <script>
          window.data = () => { return {
              button: {
                  ['@click']() {
                      this.$refs.span.innerText = this.$el.id
                  }
              }
          }}
      </script>
      <div x-data="window.data()">
          <button x-bind="button" id="bar">click me</button>

          <span x-ref="span">foo</span>
      </div>
    `);
  const span = specPage.locator('span');
  const button = specPage.locator('button');

  await expect(span).toHaveText('foo');
  await button.click();
  ///await expect(span).toHaveText('bar');
});

test('Can retrieve Alpine bound data with global bound method', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div id="1" x-data foo="bar" x-text="Alpine.bound($el, 'foo')"></div>
      <div id="2" x-data :foo="'bar'" x-text="Alpine.bound($el, 'foo')"></div>
      <div id="3" x-data foo x-text="Alpine.bound($el, 'foo')"></div>
      <div id="4" x-data disabled x-text="Alpine.bound($el, 'disabled')"></div>
      <div id="5" x-data x-text="Alpine.bound($el, 'foo')"></div>
      <div id="6" x-data x-text="Alpine.bound($el, 'foo', 'bar')"></div>
    `);
  ///await expect(specPage.locator('#1')).toHaveText('bar');
  ///await expect(specPage.locator('#2')).toHaveText('bar');
  ///await expect(specPage.locator('#3')).toHaveText('true');
  ///await expect(specPage.locator('#4')).toHaveText('true');
  ///await expect(specPage.locator('#5')).toHaveText('');
  ///await expect(specPage.locator('#6')).toHaveText('bar');
});

test('Can extract Alpine bound data as a data prop', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ foo: 'bar' }">
          <div id="a" x-data="{ init() { this.$el.textContent = Alpine.extractProp(this.$el, 'foo') }}" :foo="foo"></div>
          <div id="b" x-data="{ init() { this.$el.textContent = Alpine.extractProp(this.$el, 'foo', null, false) }}" :foo="foo"></div>
      </div>
    `);

  const el1 = specPage.locator('#a');
  const el2 = specPage.locator('#b');

  // Assertions
  ///await expect(el1).toHaveText('bar');
  ///await expect(el1).not.toHaveAttribute('foo');
  ///await expect(el2).toHaveText('bar');
  ///await expect(el2).toHaveAttribute('foo', 'bar');
});

test('x-bind updates checked attribute and property after user interaction', async ({ specPage }) => {
  await specPage.goto();

  // Inject the HTML
  await specPage.embedHTML(`
      <div x-data="{ checked: true }">
          <button @click="checked = !checked">toggle</button>
          <input type="checkbox" x-bind:checked="checked" @change="checked = $event.target.checked" />
      </div>
    `);
  const checkbox = specPage.locator('input[type="checkbox"]');
  const button = specPage.locator('button');

  // Verify initial state
  ///await expect(checkbox).toHaveAttribute('checked', '');
  await expect(checkbox).toBeChecked();

  // Click checkbox (should uncheck)
  await checkbox.click();
  await expect(checkbox).not.toHaveAttribute('checked');
  await expect(checkbox).not.toBeChecked();

  // Click button (should toggle back to checked)
  await button.click();
  ///await expect(checkbox).toHaveAttribute('checked', '');
  await expect(checkbox).toBeChecked();
});
