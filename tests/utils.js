import Stator from '../packages/statorjs/src/index';
import { screen } from '@testing-library/dom';

// This is an invisible template tag for enabling syntax highlighting of any string in most editors.
export function html(strings) {
  return strings.raw[0];
}

export function doc(strings) {
  document.body.innerHTML = html(strings);
  if (Stator.restart) Stator.restart();
  else Stator.start();
}

export function TEXT(strings) {
  return ['TEXT', strings.raw[0]];
}

export function ROLE(args) {
  return ['ROLE', args[0].raw[0], args[1]];
}

export let test = function (name, template, callback, handleExpectedErrors = false) {
  it(name, () => {
    injectHtmlAndBootStator(cy, template, callback, undefined, handleExpectedErrors);
  });
};

export let get = function (strings) {
  if (Array.isArray(strings)) {
    if (strings[0] === 'TEXT') {
    }
  } else {
    return document.querySelector(strings);
  }
};

function injectHtmlAndBootStator(cy, templateAndPotentiallyScripts, callback, page, handleExpectedErrors = false) {}
