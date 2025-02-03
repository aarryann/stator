import { describe, expect } from 'vitest';
import { test, html } from '../utils';

describe('Stator store magic vitest tests', () => {
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
      await waitFor(() => {
        expect(span.textContent).toBe('1');
      });
    }
  );
});
