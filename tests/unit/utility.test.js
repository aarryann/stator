import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import Stator from '../../packages/statorjs/src/index';
import { render, fireEvent, screen } from '@testing-library/vue';

function mountHTML(html, data = {}) {
  document.body.innerHTML = html;
  Stator.restart();
}
beforeEach(() => {
  // Clean up DOM before each test
  Stator.destroyTree(document.body);
  document.body.innerHTML = '';
});

describe('Classes Utility Tests', () => {
  it('handles class string transformations', async () => {});
});
