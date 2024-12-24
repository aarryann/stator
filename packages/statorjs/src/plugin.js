import Stator from './stator'; /// STATOR CUSTOMIZED

export function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];

  callbacks.forEach(i => i(Stator)); /// STATOR CUSTOMIZED
}
