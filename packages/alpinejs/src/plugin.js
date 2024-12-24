import Stator from './main'; /// STATOR CUSTOMIZABLE

export function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];

  callbacks.forEach(i => i(Stator)); /// STATOR CUSTOMIZABLE
}
