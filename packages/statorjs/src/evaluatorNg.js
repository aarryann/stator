import { generateEvaluatorFromFunction, runIfTypeOfFunction } from './evaluatorNormal';
import { parse } from './utils/evalsandbox';
import { closestDataStack, mergeProxies } from './scope';
import { tryCatch } from './utils/error';
import { injectMagics } from './magics';

export function ngEvaluator(el, expression) {
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
    const completeScope = mergeProxies([scope, ...dataStack]);

    const evaluatedExpression = evalSandboxed(expression, completeScope);

    runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params, el);
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

const cache = {};

export function evalSandboxed(expression, scope) {
  try {
    const parsedExpression = cache[expression] || (cache[expression] = parse(expression));
    return parsedExpression(scope);
  } catch (e) {
    throwExpressionError(expression, e);
    return;
  }
}
