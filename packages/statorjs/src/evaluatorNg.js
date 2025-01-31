import { generateEvaluatorFromFunction, runIfTypeOfFunction } from './evaluatorNormal';
import { parse } from './utils/evalparser';
import { closestDataStack, mergeProxies } from './scope';
import { tryCatch } from './utils/error';
import { toJson } from './utils/toJson';
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
    let completeScope = mergeProxies([scope, ...dataStack]);
    //let flattenedScope = Object.assign({}, scope, ...[...dataStack].reverse());

    let evaluatedExpression;
    try {
      // Parse and evaluate the expression with expr-eval
      const exprStr = expression.trim();
      if (exprStr.startsWith('{')) {
        evaluatedExpression = toJson(exprStr, completeScope);
      } else {
        evaluatedExpression = getParsed(expression)(completeScope);
      }
    } catch (e) {
      throwExpressionError(el, expression, e);
      return;
    }

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

let cache = {};

function getParsed(expression) {
  if (cache[expression]) {
    return cache[expression];
  }
  return (cache[expression] = parse(expression));
}
