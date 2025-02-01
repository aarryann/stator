import Stator from './main'; /// STATOR CUSTOMIZED

export function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];

  callbacks.forEach(i => i(Stator)); /// STATOR CUSTOMIZED
}
