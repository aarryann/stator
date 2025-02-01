import { initInterceptors } from './interceptor';
import { reactive } from './reactivity';

let stores = {};
let isReactive = false;

export function store(name, value) {
  if (!isReactive) {
    stores = reactive(stores);
    isReactive = true;
  }

  if (value === undefined) {
    return stores[name];
  }

  stores[name] = value;

  initInterceptors(stores[name]);

  if (typeof value === 'object' && value !== null && Object.prototype.hasOwnProperty.call(value, 'init') && typeof value.init === 'function') {
    /// STATOR CUSTOMIZED
    stores[name].init();
  }
}

export function getStores() {
  return stores;
}
