import { setReactivityEngine, disableEffectScheduling, reactive, effect, release, raw, watch } from './reactivity';

let Stator = {
  get reactive() {
    return reactive;
  },
  get release() {
    return release;
  },
  get effect() {
    return effect;
  },
  get raw() {
    return raw;
  },
  disableEffectScheduling,
  setReactivityEngine,
  watch
};

export default Stator;
