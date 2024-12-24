import Alpine from './alpine'; /// STATOR CUSTOMIZABLE

export function plugin(callback) {
  let callbacks = Array.isArray(callback) ? callback : [callback];

  callbacks.forEach(i => i(Alpine)); /// STATOR CUSTOMIZABLE
}
