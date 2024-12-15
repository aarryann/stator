import { describe, it, expect, beforeEach } from 'vitest';
import Stator from '../../packages/statorjs/src/index';

describe('Alpine.js-like Directives Test Suite', () => {
  let container;

  /*
  beforeEach(() => {
    // Create a fresh container for each test
    container = document.createElement('div');
    document.body.appendChild(container);
  });
*/
  // x-text Directive Test
  it('should handle x-text directive', () => {
    document.body.innerHTML = `
      <div x-data='{ "message": "Hello, world!!" }'>
        <span x-text="message"></span>
      </div>
    `;
    
    Stator.start();
    
    const span = document.querySelector('span');
    expect(span.textContent).toBe('Hello, world!!');
  });
/*
  // x-show Directive Test
  it('should handle x-show directive', () => {
    document.body.innerHTML = `
      <div x-data="{ isVisible: true }">
        <div x-show="isVisible" id="test-element">Visible Content</div>
      </div>
    `;
    
    Stator.start();
    
    const element = container.querySelector('#test-element');
    expect(element.style.display).not.toBe('none');
  });

  // x-if Directive Test (if your framework supports conditional rendering)
  it('should handle x-if directive', () => {
    document.body.innerHTML = `
      <div x-data="{ showElement: false }">
        <div x-if="showElement" id="conditional-element">Conditional Content</div>
      </div>
    `;
    
    Stator.start();
    
    const element = container.querySelector('#conditional-element');
    expect(element).toBeNull();
  });

  // x-bind Directive Test
  it('should handle x-bind directive', () => {
    document.body.innerHTML = `
      <div x-data="{ 
        buttonClass: 'primary', 
        isDisabled: false 
      }">
        <button 
          x-bind:class="buttonClass" 
          x-bind:disabled="isDisabled"
        >
          Click me
        </button>
      </div>
    `;
    
    Stator.start();
    
    const button = container.querySelector('button');
    expect(button.classList.contains('primary')).toBe(true);
    expect(button.disabled).toBe(false);
  });

  // x-on Directive Test
  it('should handle x-on:click directive', () => {
    document.body.innerHTML = `
      <div x-data="{ count: 0 }">
        <button 
          x-on:click="count++" 
          x-text="count"
        >0</button>
      </div>
    `;
    
    Stator.start();
    
    const button = container.querySelector('button');
    
    // Simulate initial state
    expect(button.textContent).toBe('0');
    
    // Simulate click
    button.click();
    
    // Verify state update
    expect(button.textContent).toBe('1');
  });

  // x-model Directive Test
  it('should handle x-model directive', () => {
    document.body.innerHTML = `
      <div x-data="{ message: 'Initial' }">
        <input x-model="message" />
        <span x-text="message"></span>
      </div>
    `;
    
    Stator.start();
    
    const input = container.querySelector('input');
    const span = container.querySelector('span');
    
    // Verify initial state
    expect(input.value).toBe('Initial');
    expect(span.textContent).toBe('Initial');
    
    // Simulate user input
    input.value = 'Updated';
    input.dispatchEvent(new Event('input'));
    
    // Verify state update
    expect(span.textContent).toBe('Updated');
  });

  // x-for Directive Test
  it('should handle x-for directive', () => {
    document.body.innerHTML = `
      <div x-data="{ items: ['apple', 'banana', 'cherry'] }">
        <ul>
          <template x-for="item in items">
            <li x-text="item"></li>
          </template>
        </ul>
      </div>
    `;
    
    Stator.start();
    
    const listItems = container.querySelectorAll('li');
    
    expect(listItems.length).toBe(3);
    expect(listItems[0].textContent).toBe('apple');
    expect(listItems[1].textContent).toBe('banana');
    expect(listItems[2].textContent).toBe('cherry');
  });

  // Complex Interaction Test
  it('should handle multiple directives together', () => {
    document.body.innerHTML = `
      <div x-data="{ 
        count: 0, 
        increment() { this.count++ },
        isEven() { return this.count % 2 === 0 }
      }">
        <button 
          x-on:click="increment()" 
          x-bind:disabled="isEven()"
        >
          Increment
        </button>
        <span x-text="count"></span>
      </div>
    `;
    
    Stator.start();
    
    const button = container.querySelector('button');
    const span = container.querySelector('span');
    
    // Initial state
    expect(span.textContent).toBe('0');
    expect(button.disabled).toBe(true);
    
    // First click
    button.click();
    expect(span.textContent).toBe('1');
    expect(button.disabled).toBe(false);
  });
  */
});