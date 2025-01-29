import { directive, prefix } from '../directives';
import { initInterceptors } from '../interceptor';
import { injectDataProviders } from '../datas';
import { addRootSelector } from '../lifecycle';
import { interceptClone, isCloning, isCloningLegacy } from '../clone';
import { addScopeToNode } from '../scope';
import { injectMagics, magic } from '../magics';
import { reactive } from '../reactivity';
import { evaluate } from '../evaluator'; /// STATOR CUSTOMIZABLE

addRootSelector(() => `[${prefix('data')}]`);

directive('data', (el, { expression }, { cleanup }) => {
  if (shouldSkipRegisteringDataDuringClone(el)) return;

  expression = expression === '' ? '{}' : expression;

  let magicContext = {};
  injectMagics(magicContext, el);

  let dataProviderContext = {};
  injectDataProviders(dataProviderContext, magicContext);

  console.log(el);
  console.log(expression);

  let data = evaluate(el, expression, { scope: dataProviderContext });
  console.log(data);

  if (data === undefined || data === true) data = {};

  injectMagics(data, el);

  let reactiveData = reactive(data);

  initInterceptors(reactiveData);

  console.log('********************************');
  let undo = addScopeToNode(el, reactiveData);
  console.log(el);

  reactiveData['init'] && evaluate(el, reactiveData['init']);

  cleanup(() => {
    reactiveData['destroy'] && evaluate(el, reactiveData['destroy']);

    undo();
  });
});

interceptClone((from, to) => {
  // Transfer over existing runtime Stator state from /// STATOR CUSTOMIZED
  // the existing dom tree over to the new one...
  if (from._x_dataStack) {
    to._x_dataStack = from._x_dataStack;

    // Set a flag to signify the new tree is using
    // pre-seeded state (used so x-data knows when
    // and when not to initialize state)...
    to.setAttribute('data-has-stator-state', true); /// STATOR CUSTOMIZED
  }
});

// If we are cloning a tree, we only want to evaluate x-data if another
// x-data context DOESN'T exist on the component.
// The reason a data context WOULD exist is that we graft root x-data state over
// from the live tree before hydrating the clone tree.
function shouldSkipRegisteringDataDuringClone(el) {
  if (!isCloning) return false;
  if (isCloningLegacy) return true;

  return el.hasAttribute('data-has-stator-state'); /// STATOR CUSTOMIZED
}
