import { closestDataStack, mergeProxies } from './scope';
import { tryCatch, handleError } from './utils/error';
import { injectMagics } from './magics';
import { Parser } from 'expr-eval'; // Import expr-eval

let shouldAutoEvaluateFunctions = true;

export function dontAutoEvaluateFunctions(callback) {
  let cache = shouldAutoEvaluateFunctions;
  shouldAutoEvaluateFunctions = false;
  let result = callback();
  shouldAutoEvaluateFunctions = cache;
  return result;
}

export function evaluate(el, expression, extras = {}) {
  let result;
  evaluateLater(el, expression)(value => (result = value), extras);
  return result;
}

export function evaluateLater(...args) {
  return theEvaluatorFunction(...args);
}

let theEvaluatorFunction = evaluator;

export function setEvaluator(newEvaluator) {
  theEvaluatorFunction = newEvaluator;
}

export function evaluator(el, expression) {
  let dataStack = generateDataStack(el);

  let evaluator = typeof expression === 'function' ? generateEvaluatorFromFunction(dataStack, expression) : generateEvaluatorFromString(dataStack, expression, el);

  return tryCatch.bind(null, el, expression, evaluator);
}

function generateDataStack(el) {
  let overriddenMagics = {};

  injectMagics(overriddenMagics, el);

  return [overriddenMagics, ...closestDataStack(el)];
}

export function generateEvaluatorFromFunction(dataStack, func) {
  return (receiver = () => {}, { scope = {}, params = [] } = {}) => {
    let result = func.apply(mergeProxies([scope, ...dataStack]), params);
    runIfTypeOfFunction(receiver, result);
  };
}

function generateEvaluatorFromString(dataStack, expression, el) {
  // Create a parser for the expression
  const parser = new Parser();

  return (receiver = () => {}, { scope = {}, params = [] } = {}) => {
    // Merge the scope with the closest data stack
    let completeScope = mergeProxies([scope, ...dataStack]);

    let evaluatedExpression;
    try {
      // Parse and evaluate the expression with expr-eval
      const exprCheck = expression.trim();
      if (exprCheck.startsWith('{')) {
        evaluatedExpression = JSON.parse(exprCheck);
      } else {
        const expr = parser.parse(expression);
        evaluatedExpression = expr.evaluate(completeScope);
      }
    } catch (e) {
      throwExpressionError(el, expression, e);
      return;
    }

    runIfTypeOfFunction(receiver, evaluatedExpression, completeScope, params, el);
  };
}

export function runIfTypeOfFunction(receiver, value, scope, params, el) {
  if (shouldAutoEvaluateFunctions && typeof value === 'function') {
    let result = value.apply(scope, params);
    if (result instanceof Promise) {
      result.then(i => runIfTypeOfFunction(receiver, i, scope, params)).catch(error => handleError(error, el, value));
    } else {
      receiver(result);
    }
  } else if (typeof value === 'object' && value instanceof Promise) {
    value.then(i => receiver(i));
  } else {
    receiver(value);
  }
}
/// STATOR CUSTOMIZED
function throwExpressionError(el, expression, error) {
  console.warn(
    `Stator Error: Stator is unable to interpret the following expression using the CSP-friendly build:

        "${expression}"

        Error: ${error.message}

        Read more about Stator's CSP-friendly build restrictions here: https://stator.io/advanced/csp
        `,
    el
  );
}
