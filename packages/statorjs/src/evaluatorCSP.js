import { generateEvaluatorFromFunction, runIfTypeOfFunction } from './evaluatorNormal';
import { closestDataStack, mergeProxies } from './scope';
import { tryCatch } from './utils/error';
import { injectMagics } from './magics';

export function cspEvaluator(el, expression) {
  let dataStack = generateDataStack(el);

  // Return if the provided expression is already a function...
  if (typeof expression === 'function') {
    return generateEvaluatorFromFunction(dataStack, expression);
  }

  let evaluator = generateEvaluator(el, expression, dataStack);

  return tryCatch.bind(null, el, expression, evaluator);
}

function generateDataStack(el) {
  let overriddenMagics = {};

  injectMagics(overriddenMagics, el);

  return [overriddenMagics, ...closestDataStack(el)];
}

function generateEvaluator(el, expression, dataStack) {
  return (receiver = () => {}, { scope = {}, params = [] } = {}) => {
    let completeScope = mergeProxies([scope, ...dataStack]);

    let evaluatedExpression = expression.split('.').reduce((currentScope, currentExpression) => {
      if (currentScope[currentExpression] === undefined) {
        throwExpressionError(el, expression);
      }

      return currentScope[currentExpression];
    }, completeScope);

    runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params);
  };
}

function throwExpressionError(el, expression) {
  console.warn(
    `Stator Error: Stator is unable to interpret the following expression using the CSP-friendly build:

"${expression}"

Read more about the Stator's CSP-friendly build restrictions here: https://stator.io/advanced/csp

`,
    el
  );
}
