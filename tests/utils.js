import Stator from '../packages/statorjs/src/index';
import { screen } from '@testing-library/dom';
import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';

// This is an invisible template tag for enabling syntax highlighting of any string in most editors.
export function html(strings) {
  return strings.raw[0];
}

export function t(strings) {
  return ['TEXT', strings.raw[0]];
}

export function r(strings) {
  return ['ROLE', strings.raw[0]];
}

export function s(strings) {
  return ['SELECTOR', strings.raw[0]];
}

export let test = function (name, template, callback, handleExpectedErrors = false) {
  it(name, () => {
    injectHtmlAndBootStator(template, callback, undefined, handleExpectedErrors);
  });
};

export let get = function (args) {
  const selectorText = args[0];
  if (Array.isArray(selectorText) && selectorText.length > 1) {
    const getType = selectorText[0];
    if (getType === 'TEXT') {
      return screen.getByText(selectorText[1]);
    } else if (getType === 'ROLE') {
      return screen.getByText(selectorText[1], ...args.slice(1));
    } else {
      return document.querySelector(selectorText[1]);
    }
  } else {
    return document.querySelector(selectorText);
  }
};

function injectHtmlAndBootStator(template, callback, page, handleExpectedErrors = false) {
  document.body.innerHTML = template;
  if (Stator.restart) Stator.restart();
  else Stator.start();
  Stator.nextTick(callback({ get, t, r, s }));
}
