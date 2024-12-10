import Stator from './stator';

export function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];

  callbacks.forEach(i => i(Stator));
}
