import Stator from '../packages/statorjs/src/index';
import { screen, waitFor } from '@testing-library/dom';
import { it } from 'vitest';

// This is an invisible template tag for enabling syntax highlighting of any string in most editors.

export function mountHTML(strings) {
  document.body.innerHTML = strings[0];
  if (Stator.restart) Stator.restart();
  else Stator.start();
}

export function html(strings) {
  return strings[0];
}

export function t(strings) {
  return ['TEXT', strings[0]];
}

export function r(strings) {
  return ['ROLE', strings[0]];
}

export function a(strings) {
  return ['SELECTORALL', strings[0]];
}

export let test = function (name, htmlString, init, callback) {
  it(name, async () => {
    await bootstrapStator(htmlString, init, callback);
  });
};

export let get = function (...args) {
  const selectorToken = args[0];
  if (Array.isArray(selectorToken) && selectorToken.length > 1) {
    const selectorType = selectorToken[0];

    const selectorText = selectorToken[1];
    if (selectorType === 'TEXT') {
      return screen.getByText(selectorText);
    } else if (selectorType === 'ROLE') {
      return screen.getByText(selectorText, args[1]);
    } else {
      //SELECTORALL
      return document.querySelectorAll(selectorText);
    }
  } else {
    return document.querySelector(selectorToken);
  }
};

async function bootstrapStator(htmlString, init, callback) {
  if (init && typeof init === 'function') {
    init({ Stator });
  }
  document.body.innerHTML = htmlString;

  if (Stator.restart) Stator.restart();
  else Stator.start();
  if (callback && typeof callback === 'function') {
    Stator.nextTick(await callback({ get, t, r, a, Stator, waitFor }));
  }
}
