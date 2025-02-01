import Stator from './../src/index';

window.Stator = Stator;

queueMicrotask(() => {
  Stator.start();
});
